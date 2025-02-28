from langchain_core.messages import HumanMessage, SystemMessage
from langchain_openai import ChatOpenAI

from langchain_community.tools.tavily_search import TavilySearchResults
from langchain_community.document_loaders import WikipediaLoader

from core.schemas import (
    GenerateAnalystsState,
    Perspectives,
    InterviewState,
    SearchQuery,
    ResearchGraphState,
    OutputState,
    Outline,
)
from core.prompts import (
    analyst_instructions,
    question_instructions,
    search_instructions,
    answer_instructions,
    outline_instructions,
    report_writer_instructions,
)

llm = ChatOpenAI(model="gpt-4o-mini", temperature=0)
tavily_search = TavilySearchResults(max_results=3)


#####* Analysts #####
def create_analysts(state: GenerateAnalystsState):
    """Node to create analysts"""

    topic = state["topic"]
    max_analysts = state["max_analysts"]
    human_analyst_feedback = state.get("human_analyst_feedback", "")

    # Enforce structured output
    structured_llm = llm.with_structured_output(Perspectives)

    # System message
    system_message = analyst_instructions.format(
        topic=topic,
        human_analyst_feedback=human_analyst_feedback,
        max_analysts=max_analysts,
    )

    # Generate question
    analysts = structured_llm.invoke(
        [SystemMessage(content=system_message)]
        + [HumanMessage(content="Generate the set of analysts.")]
    )

    # Write the list of analysis to state
    return {"analysts": analysts.analysts}


def human_feedback(state: GenerateAnalystsState):
    """No-op node that should be interrupted on"""
    pass


#####* Interview #####
def generate_question(state: InterviewState):
    """Node to generate a question"""

    # Get state
    analyst = state["analyst"]
    messages = state["messages"]

    # Generate question
    system_message = question_instructions.format(goals=analyst.persona)
    question = llm.invoke([SystemMessage(content=system_message)] + messages)
    question.name = "Interviewer"

    # Write messages to state
    return {"messages": [question]}


def search_web(state: InterviewState):
    """Retrieve docs from web search"""

    # Search query
    structured_llm = llm.with_structured_output(SearchQuery)
    search_query = structured_llm.invoke(
        [SystemMessage(content=search_instructions)] + state["messages"]
    )

    # Search
    search_docs = tavily_search.invoke(search_query.query)

    # Format
    formatted_search_docs = "\n\n---\n\n".join(
        [f'<Document href="{doc["url"]}"/>\n{doc["content"]}\n</Document>' for doc in search_docs]
    )

    return {"context": [formatted_search_docs]}


def search_wikipedia(state: InterviewState):
    """Retrieve docs from wikipedia"""

    # Search query
    structured_llm = llm.with_structured_output(SearchQuery)
    search_query = structured_llm.invoke(
        [SystemMessage(content=search_instructions)] + state["messages"]
    )

    # Search
    search_docs = WikipediaLoader(query=search_query.query, load_max_docs=2).load()

    # Format
    formatted_search_docs = "\n\n---\n\n".join(
        [
            f'<Document source="{doc.metadata["source"]}" page="{doc.metadata.get("page", "")}"/>\n{doc.page_content}\n</Document>'
            for doc in search_docs
        ]
    )

    return {"context": [formatted_search_docs]}


def generate_answer(state: InterviewState):
    """Node to answer a question"""

    # Get state
    analyst = state["analyst"]
    messages = state["messages"]
    context = state["context"]

    # Answer question
    system_message = answer_instructions.format(goals=analyst.persona, context=context)
    answer = llm.invoke([SystemMessage(content=system_message)] + messages)

    # Name the message as coming from the expert
    answer.name = "Expert"

    # Append it to state
    return {"messages": [answer]}


def save_interview(state: InterviewState):
    """Save interview on a single string"""

    # Get messages
    messages = state["messages"]

    interview = "\n\n".join(
        f"### {m.name if m.name else 'Expert'}\n\n{m.content}" for m in messages
    )

    # Save to interviews key
    return {"interviews": [interview]}


#####* Overall Research #####
def create_outline(state: ResearchGraphState):
    interviews = state["interviews"]
    topic = state["topic"]

    # Concat all interviews together
    interviews_str = "\n\n".join(
        [f"# Interview {i+1}{interview}\n\n" for i, interview in enumerate(interviews)]
    )

    system_message = outline_instructions.format(topic=topic)
    structured_llm = llm.with_structured_output(Outline)
    outline = structured_llm.invoke(
        [SystemMessage(content=system_message)]
        + [
            HumanMessage(
                content=f"Refine the outline based on your conversations with subject-matter experts:\n\nConversations:\n\n{interviews_str}"
            )
        ]
    )
    return {"outline": outline}


def write_report(state: ResearchGraphState) -> OutputState:
    topic = state["topic"]
    interviews = state["interviews"]
    outline = state["outline"]

    interviews_str = "\n\n".join(
        [f"# Interview {i+1}{interview}\n\n" for i, interview in enumerate(interviews)]
    )
    outline_str = outline.as_str

    system_message = report_writer_instructions.format(
        topic=topic, conversations=interviews_str, outline=outline_str
    )
    report = llm.invoke(
        [SystemMessage(content=system_message)]
        + [HumanMessage(content=f"Write a report based upon these conversations.")]
    )
    return {"report": report.content}
