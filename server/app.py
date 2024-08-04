import os
from dotenv import load_dotenv
from flask import Flask, request, jsonify

from langchain_chroma import Chroma
from langchain_openai import ChatOpenAI
from langchain.storage import LocalFileStore
from langchain.embeddings import CacheBackedEmbeddings
from langchain_core.runnables import RunnablePassthrough
from langchain_core.output_parsers import StrOutputParser
from langchain_huggingface.embeddings import HuggingFaceEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.document_loaders import PyPDFLoader, DirectoryLoader

from prompts import qa_prompt

app = Flask(__name__)

load_dotenv()

AI71_API_KEY = os.getenv('AI71_API_KEY')
AI71_BASE_URL = os.getenv('AI71_BASE_URL')

embeddings_model = HuggingFaceEmbeddings(
    model_name="sentence-transformers/all-mpnet-base-v2",
)

llm = ChatOpenAI(
    model="tiiuae/falcon-180B-chat",
    api_key=AI71_API_KEY,
    base_url=AI71_BASE_URL,
    streaming=True,
    temperature=0.5
)

def get_retriever(path):
    loader = DirectoryLoader(path, glob="**/*.pdf", loader_cls=PyPDFLoader)
    documents = loader.load_and_split()
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size= 1000,
        chunk_overlap= 100,
        length_function = len,
        is_separator_regex = False,
    )
    chunks = text_splitter.split_documents(documents)
    store = LocalFileStore("./cache/")
    cached_embeddings = CacheBackedEmbeddings.from_bytes_store(
        embeddings_model, store
    )
    db = Chroma.from_documents(chunks, cached_embeddings)
    retriever = db.as_retriever(search_kwargs={"k": 3})
    return retriever


def format_docs(docs):
    return "\n\n".join(doc.page_content for doc in docs)

def get_answer(retriever, query):
    qa_chain = (
        {"context": retriever | format_docs, "question": RunnablePassthrough()}
        | qa_prompt
        | llm
        | StrOutputParser()
    )
    response = qa_chain.invoke(query)
    return response

# @app.route('/chat', methods = ["POST"])
# def chat(query):
#     try:
#         input = request.get_json(force=True)
#         query = input["query"]
#         output = get_answer(query)
#         return output
#     except:
#         return jsonify({"Status":"Failure --- some error occured"})

@app.route("/")
def chat():
    retriever = get_retriever('./data')
    output = get_answer(retriever,"What are the risks an AI Governance company should keep watch of when deploying an AI solution in Europe?")
    return f"<p>{output}</p>"

if __name__ == '__main__':
    app.run()