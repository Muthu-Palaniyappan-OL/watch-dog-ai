from flask import Flask, request, jsonify
import threading
import time
from vidgear.gears import CamGear
from frame import process_a_frame
import cv2
from flask_cors import CORS

app = Flask(__name__)
CORS(app, origins=["*"])

# Global Variables
stream = None
stream_url = None
streaming_thread = None
stream_running = False
stream_lock = threading.Lock()
display_frame = True


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
def cameras():
    return jsonify(
        [
            {
                "name": "Camera 1",
                "url": "https://www.youtube.com/watch?v=IJSdhfsrnMo",
                "live": True,
            },
            {
                "name": "Camera 2",
                "url": "https://www.youtube.com/watch?v=IJSdhfsrnMo",
                "live": False,
            },
        ]
    )


if __name__ == "__main__":
    # Start the Flask app in main thread
    app.run(debug=True, use_reloader=False)
