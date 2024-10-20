from flask import Flask
from flask_sqlalchemy import SQLAlchemy
import os
from flask_cors import CORS
from dotenv import load_dotenv
from datetime import datetime


load_dotenv()


db = SQLAlchemy()  # Instantiate the SQLAlchemy object


class Camera(db.Model):
    __tablename__ = "cameras"

    id = db.Column(db.Integer, primary_key=True)  # ID for the camera
    name = db.Column(
        db.String, unique=True, nullable=False
    )  # Unique name for the camera
    monitoring = db.Column(db.Boolean, nullable=False)  # Monitoring status
    email = db.Column(db.String, nullable=False)  # Email associated with the camera
    live = db.Column(db.Boolean, nullable=False)  # Live status
    url = db.Column(db.String, nullable=False)  # URL of the camera
    start_time = db.Column(db.DateTime, nullable=False)

    def __repr__(self):
        return f"<Camera {self.name}>"


# Define the Transcript model
class Transcript(db.Model):
    __tablename__ = "transcripts"

    id = db.Column(db.Integer, primary_key=True)  # Primary key
    camera_id = db.Column(
        db.Integer, db.ForeignKey("cameras.id"), nullable=False
    )  # Foreign key to cameras
    transcript = db.Column(db.Text, nullable=False)  # Transcript text
    frame_number = db.Column(db.Integer, nullable=False)  # Transcript text

    camera = db.relationship(
        "Camera", backref="transcripts"
    )  # Relationship with Camera

    def __repr__(self):
        return f"<Transcript for Camera ID {self.camera_id}>"


class TranscriptDetailed(db.Model):
    __tablename__ = "transcripts_detailed"

    id = db.Column(db.Integer, primary_key=True)  # Primary key for this table
    camera_id = db.Column(
        db.Integer, db.ForeignKey("cameras.id"), nullable=False
    )  # Foreign key referencing cameras(id)
    frame_number = db.Column(
        db.Integer, nullable=False
    )  # Frame number for the transcript
    unusual_activity = db.Column(db.Text)  # Field for unusual activity (e.g., "none")
    human_activity = db.Column(
        db.Text
    )  # Field for human activity (e.g., "People walking...")
    animal_activity = db.Column(db.Text)  # Field for animal activity (e.g., "none")
    time = db.Column(db.Text)  # Time of day (e.g., "day", "night")
    unusual_crowd = db.Column(
        db.Text
    )  # Field for unusual crowd activity (e.g., "none")
    lighting_conditions = db.Column(db.Text)  # Lighting conditions (e.g., "well-lit")
    vehicle_details = db.Column(db.Text)  # Vehicle details (e.g., "none")
    number_of_individuals = db.Column(
        db.Text
    )  # Number of individuals (e.g., "approximately 20")
    object_presence = db.Column(db.Text)  # Field for object presence (e.g., "none")
    context_notes = db.Column(
        db.Text
    )  # Additional context notes (e.g., "The scene appears to...")

    # Define relationship (optional, depends on your schema)
    camera = db.relationship(
        "Camera", backref=db.backref("transcripts_detailed", lazy=True)
    )


class AnalyticsData(db.Model):
    __tablename__ = "analytics_data"

    camera_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    total_footage_analyzed = db.Column(db.Integer, nullable=False)
    total_individuals_detected = db.Column(db.Integer, nullable=False)
    average_human_passerbys_per_footage = db.Column(db.Float, nullable=False)
    total_unusual_incidents = db.Column(db.Integer, nullable=False)
    total_animal_incidents = db.Column(db.Integer, nullable=False)
    total_unusual_crowd_incidents = db.Column(db.Integer, nullable=False)
    total_vehicle_detected = db.Column(db.Integer, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.now(), nullable=False)


class Alert(db.Model):
    __tablename__ = "alerts"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    camera_id = db.Column(db.Integer, nullable=False)  # Reference to the camera
    alert_type = db.Column(db.Text, nullable=False)  # Type of alert
    description = db.Column(
        db.Text, nullable=False
    )  # Detailed description of the alert
    timestamp = db.Column(
        db.DateTime, default=datetime.now(), nullable=False
    )  # When the alert was generated
    status = db.Column(
        db.Text, default="unacknowledged", nullable=False
    )  # Status of the alert
    frame_number = db.Column(
        db.Integer, nullable=False
    )  # Frame number associated with the alert


class Chats(db.Model):
    __tablename__ = "chats"

    id = db.Column(db.Integer, primary_key=True)
    camera_id = db.Column(db.Integer, db.ForeignKey("cameras.id"), nullable=False)
    request = db.Column(db.Text, nullable=False)
    response = db.Column(db.Text, nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    frames = db.Column(db.ARRAY(db.Integer))

    def __repr__(self):
        return f"<Chat {self.id}: {self.request}>"


def create_app():
    app = Flask(__name__)
    app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv("DATABASE_URL")
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    CORS(app, origins=["*"])

    db.init_app(app)  # Initialize the database with the app

    with app.app_context():
        db.create_all()  # Create database tables

    return app


app = create_app()
