from langchain.prompts import PromptTemplate

qa_template = """Your are a legal expert in AI governance and ethics.Answer the question based on the context provided. 
If you don't know the answer, say that it is not within the scope of the documentation. Don't try to make up an answer.

Context: {context}
Question: {question}
Answer:"""

qa_prompt = PromptTemplate(
    template= qa_template,
    input_variables=["context", "question"]
)


