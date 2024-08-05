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


eu_template = """You are a legal expert in the EU AI Act. You are tasked
with classifying the risk level - Unacceptable, High, Limited or Minimal - of the 
given AI system based on description and the context. You need to give a 
detailed report explaining why you have assigned that risk level. If possible, cite 
relevant passages in the EU AI Act. Explain in a simple and straightforward manner.
If you don't know the answer, say you do not know. Don't try to make up an answer.

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