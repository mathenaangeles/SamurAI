import json
from config import db
from datetime import datetime
from sqlalchemy import Enum, Text
from sqlalchemy.ext.mutable import MutableList

class Project(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(250), unique=False, nullable=False)
    description = db.Column(db.Text(), unique=False, nullable=False)
    market = db.Column(db.String(250), unique=False, nullable=False)
    created_date = db.Column(db.DateTime, default=datetime.now(), nullable=False)
    eu_risk = db.Column(Enum('Unacceptable', 'High', 'Limited', 'Minimal', name='risk_level'), nullable=True)
    eu_risk_reason = db.Column(db.Text(), unique=False, nullable=True)
    attachment = db.Column(db.String(255), unique=False, nullable=True) 

    def to_json(self):
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "market": self.market,
            "createdDate": self.created_date,
            "euRisk": self.eu_risk,
            "euRiskReason": self.eu_risk_reason,
            "attachment": self.attachment,
        }
    