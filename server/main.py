import os
from models import Project
from config import app, db
from prompts import qa_prompt, eu_prompt, output_parser
from flask import request, jsonify

from langchain_chroma import Chroma
from langchain_openai import ChatOpenAI
from langchain.storage import LocalFileStore
from langchain.embeddings import CacheBackedEmbeddings
from langchain_core.runnables import RunnablePassthrough
from langchain_core.output_parsers import StrOutputParser
from langchain_huggingface.embeddings import HuggingFaceEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.document_loaders import PyPDFLoader, DirectoryLoader

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

loader = DirectoryLoader('./data', glob="**/*.pdf", loader_cls=PyPDFLoader)
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

def format_docs(docs):
    return "\n\n".join(doc.page_content for doc in docs)

def generate_answer(query):
    qa_chain = (
        {"context": retriever | format_docs, "question": RunnablePassthrough()}
        | qa_prompt
        | llm
        | StrOutputParser()
    )
    response = qa_chain.invoke(query)
    return response

def generate_risk(description):
    eu_chain = (
        {"context": retriever | format_docs, "description": RunnablePassthrough()}
        | eu_prompt
        | llm
        | StrOutputParser()
    )
    response = eu_chain.invoke(description)
    return response

@app.route("/projects", methods=["POST", "GET"])
def get_projects():
    if request.method == 'POST':
        data = request.json
        name = data.get("name")
        description = data.get("description")
        market = data.get("market")
        json_eu_risk = output_parser.parse(generate_risk(description))
        eu_risk = json_eu_risk['risk']
        eu_risk_reason = json_eu_risk['reason']
        if not name or not description or not market:
            return jsonify({"message": "There are missing required field."}), 400
        new_project = Project(
            name=name, 
            description=description,
            market=market,
            eu_risk = eu_risk,
            eu_risk_reason = eu_risk_reason
        )
        try:
            db.session.add(new_project)
            db.session.commit()
        except Exception as e:
            return jsonify({"message": str(e)}), 400
        return jsonify({"message": "New project has been successfully registered."}), 201
    else:
        projects = Project.query.all()
        json_projects = list(map(lambda x: x.to_json(), projects))
        return jsonify({"projects": json_projects}), 200

@app.route("/project/<int:id>", methods=["PATCH", "DELETE", "GET"])
def get_project(id):
    project = Project.query.get(id)
    if not project:
        return jsonify({"message": "Project could not be found."}), 404
    if request.method == 'PATCH':
        project.name = request.json.get("name", project.name)
        db.session.commit()
        return jsonify({"message": "Project has been successfully updated."}), 200
    elif request.method == 'DELETE':
        db.session.delete(project)
        db.session.commit()
        return jsonify({"message": "Project has been successfully deleted."}), 200
    else:
        return project, 200

# @app.route("/")
# def chat():
#     output = generate_risk("This AI system uses facial recognition to enhance security by identifying individuals in real-time.")
#     return f"<p>{output}</p>"

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)