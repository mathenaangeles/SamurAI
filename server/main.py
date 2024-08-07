import os
import json
from models import Project
from config import app, db
from flask import request, jsonify
from werkzeug.utils import secure_filename
from prompts import qa_prompt, eu_prompt, output_parser

from langchain_chroma import Chroma
from langchain_openai import ChatOpenAI
from langchain.storage import LocalFileStore
from langchain.embeddings import CacheBackedEmbeddings
from langchain_core.output_parsers import StrOutputParser
from langchain_huggingface.embeddings import HuggingFaceEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_core.runnables import RunnablePassthrough, RunnableParallel
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
chroma_db = Chroma.from_documents(chunks, cached_embeddings)
retriever = chroma_db.as_retriever(search_kwargs={"k": 3})

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
        data = request.form
        name = data.get("name")
        description = data.get("description")
        market = data.get("market")
        json_eu_risk = output_parser.parse(generate_risk(description))
        eu_risk = json_eu_risk['risk']
        eu_risk_reason = json_eu_risk['reason']
        attachment = request.files.get("attachment")
        if not name or not description or not market:
            return jsonify({"message": "There are missing required field."}), 400
        file_path = None
        if attachment:
            filename = secure_filename(attachment.filename)
            file_path = os.path.join(app.config['DATA_DIRECTORY'], filename)
            attachment.save(file_path)
        new_project = Project(
            name = name, 
            description = description,
            market = market,
            eu_risk = eu_risk,
            eu_risk_reason = eu_risk_reason,
            attachment = file_path,
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
        return project.to_json(), 200

def format_answer(answer):
    if answer.endswith("User:"):
        return answer[:-len("User:")].strip()
    return answer
    
def extract_sources(response):
    sources = []
    if 'context' in response and isinstance(response['context'], list):
        for doc in response['context']:
            source = doc.metadata.get('source') 
            if source and source not in sources:
                sources.append(source)
    return sources

@app.route("/", methods=["POST"])
def chat():
    query = request.json.get("query", "")
    if not query:
        return jsonify({"error": "Ask me a question."}), 400
    qa_chain_from_docs = (
        RunnablePassthrough.assign(context=(lambda x: format_docs(x["context"])))
        | qa_prompt
        | llm
        | StrOutputParser()
    )
    qa_chain_with_sources = RunnableParallel(
        {"context": retriever, "question": RunnablePassthrough()}
    ).assign(answer=qa_chain_from_docs)
    response = qa_chain_with_sources.invoke(query)
    response_dict = {
        "answer": format_answer(response.get("answer", "")),
        "context": extract_sources(response)
    }
    return jsonify(response_dict), 200

@app.route("/files", methods=["GET"])
def get_files():
    data_dir = './data'
    files = []
    for filename in os.listdir(data_dir):
        filepath = os.path.join(data_dir, filename)
        if os.path.isfile(filepath):
            file_info = {
                'filename': filename,
                'size': os.path.getsize(filepath),
                'creation_date': os.path.getctime(filepath),
                'last_modified_date': os.path.getmtime(filepath)
            }
            files.append(file_info)
    return jsonify(files), 200

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)