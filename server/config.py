import os
from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)
CORS(app)

load_dotenv()

app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv('SQLALCHEMY_DATABASE_URI')
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = os.getenv('SQLALCHEMY_TRACK_MODIFICATIONS')
app.config['DATA_DIRECTORY'] = os.getenv('DATA_DIRECTORY') 

db = SQLAlchemy(app)