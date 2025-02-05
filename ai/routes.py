from langgraph.graph import END
from langchain_core.messages import AIMessage

from schemas import GenerateAnalystsState, InterviewState


def should_continue(state: GenerateAnalystsState):
    """Return the next node to execute"""

    # Check if human feedback
    human_analyst_feedback = state.get("human_analyst_feedback", None)
    if human_analyst_feedback:
        return "create_analysts"

    # Otherwise end
    return END


def route_messages(state: InterviewState, name: str = "expert"):
    """Route between question and answer"""

    # Get messages
    messages = state["messages"]
    max_num_turns = state.get("max_num_turns", 2)

    # Check the number of expert answers
    num_responses = len([m for m in messages if isinstance(m, AIMessage) and m.name == name])

    # End if expert has answered more than the max turns
    if num_responses >= max_num_turns:
        return "save_interview"

    # This router is run after each question - answer pair
    # Get the last question asked to check if it signals the end of discussion
    last_question = messages[-2]

    if "Thank you so much for your help" in last_question.content:
        return "save_interview"
    return "ask_question"
