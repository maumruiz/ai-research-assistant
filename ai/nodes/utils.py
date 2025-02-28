from langchain_core.messages import AIMessage, HumanMessage, ToolMessage
from langchain_core.prompts import MessagesPlaceholder


def tag_with_name(ai_message: AIMessage, name: str):
    ai_message.name = name
    return ai_message
