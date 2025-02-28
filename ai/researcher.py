from langgraph.graph import START, END, StateGraph

from core.schemas import InterviewState, ResearchGraphState, InputState, OutputState
from core.nodes import (
    generate_question,
    search_web,
    search_wikipedia,
    generate_answer,
    save_interview,
)
from core.nodes import create_analysts, human_feedback, write_report, create_outline
from core.routes import route_messages, initiate_all_interviews

from configuration import Configuration

# * Interview Graph
# Add nodes
interview_builder = StateGraph(InterviewState)
interview_builder.add_node("ask_question", generate_question)
interview_builder.add_node("search_web", search_web)
interview_builder.add_node("search_wikipedia", search_wikipedia)
interview_builder.add_node("answer_question", generate_answer)
interview_builder.add_node("save_interview", save_interview)

# Add edges
interview_builder.add_edge(START, "ask_question")
interview_builder.add_edge("ask_question", "search_web")
interview_builder.add_edge("ask_question", "search_wikipedia")
interview_builder.add_edge("search_web", "answer_question")
interview_builder.add_edge("search_wikipedia", "answer_question")
interview_builder.add_conditional_edges(
    "answer_question", route_messages, ["ask_question", "save_interview"]
)
interview_builder.add_edge("save_interview", END)


# * Research Graph
# Nodes and edges
builder = StateGraph(
    ResearchGraphState, config_schema=Configuration, input=InputState, output=OutputState
)

builder.add_node("create_analysts", create_analysts)
builder.add_node("human_feedback", human_feedback)
builder.add_node("conduct_interview", interview_builder.compile())
builder.add_node("create_outline", create_outline)
builder.add_node("write_report", write_report)

builder.add_edge(START, "create_analysts")
builder.add_edge("create_analysts", "human_feedback")
builder.add_conditional_edges(
    "human_feedback", initiate_all_interviews, ["create_analysts", "conduct_interview"]
)
builder.add_edge("conduct_interview", "create_outline")
builder.add_edge("create_outline", "write_report")
builder.add_edge("write_report", END)

# Compile the graph
graph = builder.compile(interrupt_before=["human_feedback"])
