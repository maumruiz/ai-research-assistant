from typing import List
from typing_extensions import TypedDict
from pydantic import BaseModel, Field

from langchain_core.prompts import ChatPromptTemplate

from nodes.llms import fast_llm


###* Prompts
analyst_instructions = """
You are tasked with creating a set of diverse (and distinct) AI analyst personas, \
who will work together to create a comprehensive article on a topic given by the user.\
Each of the analysts represents a different perspective, role or affiliation related\
to this topic.
Follow these instructions carefully:

1. First, review the research topic
2. Examine any editorial feedback that has been optionally provided to guide creation of the analysts:
{human_analyst_feedback}    
3. Determine the most interesting themes based upon documents and / or feedback above.                    
4. Pick the top {max_analysts} themes.
5. Assign one analyst to each theme.
"""

gen_perspectives_prompt = ChatPromptTemplate.from_messages(
    [
        ("system", analyst_instructions),
        ("user", "Topic of interest: {topic}"),
    ]
)


###* Schemas
class Analyst(BaseModel):
    affiliation: str = Field(description="Primary affiliation of the analyst.")
    name: str = Field(description="Name of the analyst.")
    role: str = Field(description="Role of the analyst in the context of the topic.")
    description: str = Field(description="Description of the analyst focus, concerns, and motives.")

    @property
    def persona(self) -> str:
        return f"Name: {self.name}\nRole: {self.role}\nAffiliation: {self.affiliation}\nDescription: {self.description}\n"


class Perspectives(BaseModel):
    analysts: List[Analyst] = Field(
        description="Comprehensive list of analysts with their roles and affiliations."
    )


class GenerateAnalystsState(TypedDict):
    topic: str  # Research topic
    max_analysts: int  # Number of analysts
    human_analyst_feedback: str  # Human feedback
    analysts: List[Analyst]  # Analyst asking questions


###* Chains
structured_llm = fast_llm.with_structured_output(Perspectives)
generate_perspectives_chain = gen_perspectives_prompt | structured_llm


###* Nodes
def create_analysts(state: GenerateAnalystsState):
    """Node to create analysts"""

    topic = state["topic"]
    max_analysts = state["max_analysts"]
    human_analyst_feedback = state.get("human_analyst_feedback", "")

    perspectives = generate_perspectives_chain.invoke(
        {
            "topic": topic,
            "max_analysts": max_analysts,
            "human_analyst_feedback": human_analyst_feedback,
        }
    )

    # Write the list of analysis to state
    return {"analysts": perspectives.analysts}
