from flask import Flask, request, jsonify, make_response
import threading
import time
from vidgear.gears import CamGear
from frame import process_a_frame, test_process_image
import cv2
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from dotenv import load_dotenv
import os
from datetime import datetime

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)
CORS(app, origins=["*"])
# Database connection details
app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv("DATABASE_URL")
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

db = SQLAlchemy(app)

# Global Variables
stream = None
stream_url = None
streaming_thread = None
stream_running = False
stream_lock = threading.Lock()
display_frame = True


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

    camera = db.relationship(
        "Camera", backref="transcripts"
    )  # Relationship with Camera

    def __repr__(self):
        return f"<Transcript for Camera ID {self.camera_id}>"


with app.app_context():
    db.create_all()


def start_stream(url):
    """Function to start the YouTube stream."""
    global stream, stream_running, display_frame
    stream = CamGear(source=url, stream_mode=True, logging=True).start()
    stream_running = True
    while stream_running:
        frame = stream.read()
        if frame is None:
            break
        process_a_frame(frame)
        if display_frame:
            cv2.imshow("Output Frame", frame)
        key = cv2.waitKey(15) & 0xFF
        if key == ord("q"):
            stop_stream()
            break
    if display_frame:
        cv2.destroyAllWindows()


def stop_stream():
    """Function to stop the YouTube stream."""
    global stream, stream_running, display_frame
    if stream is not None:
        stream_running = False
        stream.stop()
        stream = None
        if display_frame:
            cv2.destroyAllWindows()


def stream_manager():
    """Thread function to manage the stream."""
    global stream_url, streaming_thread, stream_running
    while True:
        if stream_running:
            start_stream(stream_url)
        time.sleep(1)


@app.route("/start", methods=["POST"])
def start():
    """API to start the stream."""
    global stream_url, stream_running, streaming_thread

    if stream_running:
        return jsonify({"error": "Stream is already running!"}), 400

    data = request.json
    url = data.get("url")
    if not url:
        return jsonify({"error": "Please provide a valid URL"}), 400

    stream_url = url

    # Start streaming thread
    streaming_thread = threading.Thread(target=start_stream, args=(stream_url,))
    streaming_thread.start()

    return jsonify({"message": f"Stream started with URL: {stream_url}"}), 200


@app.route("/stop", methods=["POST"])
def stop():
    """API to stop the stream."""
    global stream_running
    if not stream_running:
        return jsonify({"error": "No stream is running!"}), 400

    stop_stream()
    return jsonify({"message": "Stream stopped!"}), 200


@app.route("/process_image", methods=["POST"])
def process_image():
    """API to stop the stream."""
    test_process_image("image.png")
    return jsonify({"message": "image processed!"}), 200


@app.route("/change", methods=["POST"])
def change():
    """API to change the stream URL while streaming."""
    global stream_url, stream_running, streaming_thread

    data = request.json
    url = data.get("url")
    if not url:
        return jsonify({"error": "Please provide a valid URL"}), 400

    if not stream_running:
        return jsonify({"error": "No stream is running!"}), 400

    # Stop current stream and start with new URL
    stop_stream()
    stream_url = url

    # Restart stream with new URL
    streaming_thread = threading.Thread(target=start_stream, args=(stream_url,))
    streaming_thread.start()

    return jsonify({"message": f"Stream changed to URL: {stream_url}"}), 200


@app.get("/getcams")
def getcams():
    return jsonify(
        [
            {
                "id": d.id,
                "email": d.email,
                "live": d.live,
                "monitoringStatus": d.monitoring,
                "name": d.name,
                "url": d.url,
                "start_time": d.start_time.strftime("%Y-%m-%d %H:%M:%S"),
            }
            for d in Camera.query.all()
        ]
    )


@app.post("/addcams")
def addcams():
    data = request.json
    try:
        # Check if there is already a camera with monitoring set to True
        existing_monitoring_camera = Camera.query.filter_by(monitoring=True).first()

        if data.get("monitoringStatus") and existing_monitoring_camera:
            return jsonify({"error": "Only 1 camera should be monitoring"}), 400

        cam = Camera()
        cam.email = data["email"]
        cam.live = data["live"]
        cam.monitoring = data["monitoringStatus"]
        cam.name = data["name"]
        cam.url = data["url"]

        if "start_time" in data:
            cam.start_time = datetime.strptime(data["start_time"], "%Y-%m-%d %H:%M:%S")
        else:
            cam.start_time = db.func.current_timestamp()

        db.session.add(cam)
        db.session.commit()

        return jsonify({"msg": "success"})

    except Exception as e:
        error = jsonify({"error": str(e)})
        return error, 400


# Update a camera
@app.put("/updatecam/<int:camera_id>")
def update_cam(camera_id):
    data = request.json
    try:
        # Find the camera by its ID
        cam = Camera.query.get(camera_id)

        # If camera is not found, return an error
        if not cam:
            return jsonify({"error": "Camera not found"}), 404

        # Check if another camera is already set as monitoring, and prevent updates if so
        if "monitoringStatus" in data and data["monitoringStatus"]:
            existing_monitoring_camera = Camera.query.filter(
                Camera.monitoring == True, Camera.id != camera_id
            ).first()
            if existing_monitoring_camera:
                return jsonify({"error": "Only 1 camera should be monitoring"}), 400

        # Update the camera fields based on the request data
        if "email" in data:
            cam.email = data["email"]
        if "live" in data:
            cam.live = data["live"]
        if "monitoringStatus" in data:
            cam.monitoring = data["monitoringStatus"]
        if "name" in data:
            cam.name = data["name"]
        if "url" in data:
            cam.url = data["url"]

        if "start_time" in data:
            cam.start_time = datetime.strptime(data["start_time"], "%Y-%m-%d %H:%M:%S")

        # Commit the changes to the database
        db.session.commit()

        return jsonify({"msg": "Camera updated successfully"})

    except Exception as e:
        # Handle any exception and return an error response
        error = jsonify({"error": str(e)})
        return error, 400


if __name__ == "__main__":
    # Start the Flask app in main thread
    app.run(debug=True, use_reloader=False)
