from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class Review(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    text = db.Column(db.Text, nullable=False)
    prediction = db.Column(db.String(10))  # AI or Human
    sentiment = db.Column(db.String(10))   # Positive/Negative
    date = db.Column(db.DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f"<Review {self.id}>"