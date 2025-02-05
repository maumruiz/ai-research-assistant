from langchain_core.messages import HumanMessage, SystemMessage, get_buffer_string
from langchain_openai import ChatOpenAI

from langchain_community.tools.tavily_search import TavilySearchResults
from langchain_community.document_loaders import WikipediaLoader

from schemas import GenerateAnalystsState, Perspectives, InterviewState, SearchQuery, ResearchGraphState
from prompts import (
    analyst_instructions,
    question_instructions,
    search_instructions,
    answer_instructions,
    section_writer_instructions,
    report_writer_instructions,
    intro_conclusion_instructions,
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
        [SystemMessage(content=system_message)] + [HumanMessage(content="Generate the set of analysts.")]
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

    # Write messages to state
    return {"messages": [question]}


def search_web(state: InterviewState):
    """Retrieve docs from web search"""

    # Search query
    structured_llm = llm.with_structured_output(SearchQuery)
    search_query = structured_llm.invoke([SystemMessage(content=search_instructions)] + state["messages"])

    # Search
    search_docs = tavily_search.invoke(search_query.search_query)

    # Format
    formatted_search_docs = "\n\n---\n\n".join(
        [f'<Document href="{doc["url"]}"/>\n{doc["content"]}\n</Document>' for doc in search_docs]
    )

    return {"context": [formatted_search_docs]}


def search_wikipedia(state: InterviewState):
    """Retrieve docs from wikipedia"""

    # Search query
    structured_llm = llm.with_structured_output(SearchQuery)
    search_query = structured_llm.invoke([SystemMessage(content=search_instructions)] + state["messages"])

    # Search
    search_docs = WikipediaLoader(query=search_query.search_query, load_max_docs=2).load()

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
    answer.name = "expert"

    # Append it to state
    return {"messages": [answer]}


def save_interview(state: InterviewState):
    """Save interview on a single string"""

    # Get messages
    messages = state["messages"]

    # Convert interview to a string
    interview = get_buffer_string(messages)

    # Save to interviews key
    return {"interview": interview}


def write_section(state: InterviewState):
    """Node to answer a question"""

    # Get state
    interview = state["interview"]
    context = state["context"]
    analyst = state["analyst"]

    # Write section using either the gathered source docs from interview (context) or the interview itself (interview)
    system_message = section_writer_instructions.format(focus=analyst.description)
    section = llm.invoke(
        [SystemMessage(content=system_message)]
        + [HumanMessage(content=f"Use this source to write your section: {context}")]
    )

    # Append it to state
    return {"sections": [section.content]}


#####* Overall Research #####
def write_report(state: ResearchGraphState):
    # Full set of sections
    sections = state["sections"]
    topic = state["topic"]

    # Concat all sections together
    formatted_str_sections = "\n\n".join([f"{section}" for section in sections])

    # Summarize the sections into a final report
    system_message = report_writer_instructions.format(topic=topic, context=formatted_str_sections)
    report = llm.invoke(
        [SystemMessage(content=system_message)] + [HumanMessage(content=f"Write a report based upon these memos.")]
    )
    return {"content": report.content}


def write_introduction(state: ResearchGraphState):
    # Full set of sections
    sections = state["sections"]
    topic = state["topic"]

    # Concat all sections together
    formatted_str_sections = "\n\n".join([f"{section}" for section in sections])

    # Summarize the sections into a final report

    instructions = intro_conclusion_instructions.format(topic=topic, formatted_str_sections=formatted_str_sections)
    intro = llm.invoke([instructions] + [HumanMessage(content=f"Write the report introduction")])
    return {"introduction": intro.content}


def write_conclusion(state: ResearchGraphState):
    # Full set of sections
    sections = state["sections"]
    topic = state["topic"]

    # Concat all sections together
    formatted_str_sections = "\n\n".join([f"{section}" for section in sections])

    # Summarize the sections into a final report

    instructions = intro_conclusion_instructions.format(topic=topic, formatted_str_sections=formatted_str_sections)
    conclusion = llm.invoke([instructions] + [HumanMessage(content=f"Write the report conclusion")])
    return {"conclusion": conclusion.content}


def finalize_report(state: ResearchGraphState):
    """The is the "reduce" step where we gather all the sections, combine them, and reflect on them to write the intro/conclusion"""
    # Save full final report
    content = state["content"]
    if content.startswith("## Insights"):
        content = content.strip("## Insights")
    if "## Sources" in content:
        try:
            content, sources = content.split("\n## Sources\n")
        except:
            sources = None
    else:
        sources = None

    final_report = state["introduction"] + "\n\n---\n\n" + content + "\n\n---\n\n" + state["conclusion"]
    if sources is not None:
        final_report += "\n\n## Sources\n" + sources
    return {"final_report": final_report}
