from langchain.prompts import PromptTemplate
from langchain.output_parsers import StructuredOutputParser, ResponseSchema

qa_template = """Your are a legal expert in AI governance and ethics. Answer the question based on the context provided. 
If you don't know the answer, say that it is not within the scope of the documentation. Don't try to make up an answer.

Context: {context}
Question: {question}
Answer:"""

qa_prompt = PromptTemplate(
    template= qa_template,
    input_variables=["context", "question"]
)


eu_template = """You are a legal expert in the EU AI Act. Your task is to classify the risk level of a given AI system according to the EU AI Act's framework. 
The risk levels are categorized as follows: Unacceptable, High, Limited, or Minimal. Provide a comprehensive and detailed report explaining the risk level 
assigned to the AI system based on the provided description and context. You need to give a detailed report explaining why you have assigned 
that risk level. Make sure you consider all aspects carefully. If possible, cite relevant passages in the EU AI Act to back
up your assessment. If you don't know the answer, say you do not know. Don't try to make up an answer.

Your report should include:
1. Risk Classification: Clearly state the risk level of the AI system.
2. Detailed Reasoning: Explain why the assigned risk level is appropriate, considering the following aspects:
   - Purpose and Use: Evaluate the intended purpose of the AI system and its use cases.
   - Impact on Fundamental Rights: Analyze how the AI system affects fundamental rights such as privacy, non-discrimination, and other rights protected under the EU Charter of Fundamental Rights.
   - Level of Harm or Threat: Assess the potential harm or threat posed by the AI system to individuals and society.
   - Mitigation Measures: Consider any existing or proposed measures to mitigate risks associated with the AI system.
   - Compliance with EU AI Act: Reference relevant passages from the EU AI Act that support your classification. Highlight specific articles or sections that justify your assessment.

If there are specific provisions in the EU AI Act that apply to the AI system in question, cite them explicitly in your reasoning. Ensure your explanation is clear, detailed, and supported by the text of the Act.


Context: {context}
Description: {description}

Question: What is the EU AI Act risk level of this AI system?
Answer:{format_instructions}"""

response_schemas = [
    ResponseSchema(name="risk", description="This is the risk level. It should be either Unacceptible, High, Limited or Minimal."),
    ResponseSchema(name="reason", description="This is the reason for why that risk level has been assigned based on the EU AI Act.")
]
output_parser = StructuredOutputParser.from_response_schemas(response_schemas)
format_instructions = output_parser.get_format_instructions()
eu_prompt = PromptTemplate(
    template=eu_template,
    input_variables=["context", "description"],
    partial_variables={"format_instructions": format_instructions}
)