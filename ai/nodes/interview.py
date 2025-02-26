import operator
from typing import Annotated, List, Optional
from typing_extensions import TypedDict
from pydantic import BaseModel, Field

from langchain_core.messages import AnyMessage, AIMessage, HumanMessage, ToolMessage
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.runnables import RunnableLambda
from langgraph.graph import MessagesState

from nodes.analysts import Analyst
from nodes.llms import fast_llm

###* Prompts
question_instructions = """
You are an analyst tasked with interviewing an expert to learn about a specific topic. 
Now, you are chatting with an expert to get information and your goal is boil down to interesting and specific insights related to your topic.
1. Interesting: Insights that people will find surprising or non-obvious.        
2. Specific: Insights that avoid generalities and include specific examples from the expert.
When you are satisfied with your understanding, complete the interview with: "Thank you so much for your help!"
Please only ask one question at a time and don't ask what you have asked before.\
Your questions should be related to the topic you want to learn.
Be comprehensive and curious, gaining as much unique insight from the expert as possible.\
Begin by introducing yourself using a name that fits your persona, and then ask your question. \
Continue to ask questions to drill down and refine your understanding of the topic. \
Remember to stay in character throughout your response, reflecting the persona and goals provided to you.

Here is your specific perspective:
{persona}
"""

generate_question_prompt = ChatPromptTemplate.from_messages(
    [
        ("system", question_instructions),
        MessagesPlaceholder(variable_name="messages", optional=True),
    ]
)


###* Schemas
def update_references(references, new_references):
    if not references:
        references = {}
    references.update(new_references)
    return references


class InterviewState(TypedDict):
    messages: Annotated[List[AnyMessage], operator.add]
    references: Annotated[Optional[dict], update_references]
    analyst: Analyst


###* Utils
def swap_roles(state: InterviewState, name: str):
    converted = []
    for message in state["messages"]:
        if isinstance(message, AIMessage) and message.name != name:
            message = HumanMessage(**message.model_dump(exclude={"type"}))
        converted.append(message)
    return {"messages": converted}


def tag_with_name(ai_message: AIMessage, name: str):
    ai_message.name = name
    return ai_message


###* Nodes
def generate_question(state: InterviewState):
    """Node to generate a question"""

    # Get state
    analyst = state["analyst"]

    # Generate question
    # system_message = question_instructions.format(goals=analyst.persona)
    # question = llm.invoke([SystemMessage(content=system_message)] + messages)

    generate_question_chain = (
        RunnableLambda(swap_roles).bind(name=analyst.name)
        | generate_question_prompt.partial(persona=analyst.persona)
        | fast_llm
        | RunnableLambda(tag_with_name).bind(name=analyst.name)
    )

    question = generate_question_chain.invoke(state)

    # Write messages to state
    return {"messages": [question]}
