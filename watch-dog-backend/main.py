import asyncio
from flask import Flask, request, jsonify, make_response, current_app
import threading
import time
from vidgear.gears import CamGear
from frame import process_a_frame, test_process_image
import cv2
from flask_sqlalchemy import SQLAlchemy
from vision import get_caption, image_path_to_image_b64
import os
from datetime import datetime
from db import Camera, TranscriptDetailed

# Load environment variables from .env file


# Global Variables
stream = None
stream_url = None
streaming_thread = None
stream_running = False
stream_lock = threading.Lock()
display_frame = True
from db import db, app


def start_stream(url, camera_id):
    """Function to start the YouTube stream."""
    global stream, stream_running, display_frame

    def run_event_loop(loop):
        asyncio.set_event_loop(loop)
        loop.run_forever()

    loop = asyncio.new_event_loop()
    t = threading.Thread(target=run_event_loop, args=(loop,))
    t.start()

    stream = CamGear(source=url, stream_mode=True, logging=True).start()
    stream_running = True
    while stream_running:
        frame = stream.read()
        if frame is None:
            break
        process_a_frame(frame, loop, camera_id)
        if display_frame:
            cv2.imshow("Output Frame", frame)
        key = cv2.waitKey(15) & 0xFF
        if key == ord("q"):
            stop_stream()
            t.join()
            break
    if display_frame:
        cv2.destroyAllWindows()
        t.join()


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
    global stream_running, streaming_thread

    camera = Camera.query.filter_by(monitoring=True).first()
    if camera is None:
        return jsonify({"error": "Nothing is monitoring ready."}), 400

    if stream_running:
        return jsonify({"error": "Stream is already running!"}), 400

    stream_url = camera.url

    # Start streaming thread
    streaming_thread = threading.Thread(
        target=start_stream, args=(stream_url, camera.id)
    )
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


@app.get("/transcripts/<int:camera_id>")
def get_all_transcripts(camera_id):
    return jsonify(
        [
            {
                "frame_number": d.frame_number,
                "unusual_activity": d.unusual_activity,
                "human_activity": d.human_activity,
                "animal_activity": d.animal_activity,
                "time": d.time,
                "unusual_crowd": d.unusual_crowd,
                "lighting_conditions": d.lighting_conditions,
                "vehicle_details": d.vehicle_details,
                "number_of_individuals": d.number_of_individuals,
                "object_presence": d.object_presence,
                "context_notes": d.context_notes,
            }
            for d in TranscriptDetailed.query.filter_by(camera_id=camera_id).all()
        ]
    )


@app.get("/transcripts/<string:activity_name>/")
@app.get("/transcripts/<string:activity_name>/<int:camera_id>")
def activity_name(activity_name, camera_id=None):

    query = TranscriptDetailed.query.with_entities(
        TranscriptDetailed.frame_number, getattr(TranscriptDetailed, activity_name)
    )

    # If camera_id is provided, filter by that camera_id
    if camera_id is not None:
        query = query.filter_by(camera_id=camera_id).filter(
            getattr(TranscriptDetailed, activity_name) != "none"
        )

    # Fetch all matching records
    data = query.all()

    # Return the JSON response with dynamic field name
    return jsonify(
        [
            {
                "frame_number": d.frame_number,
                activity_name: getattr(d, activity_name),
            }
            for d in data
        ]
    )


if __name__ == "__main__":
    app.run(debug=True, use_reloader=False)
