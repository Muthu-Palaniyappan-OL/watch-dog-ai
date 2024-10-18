import streamlit as st
import cv2
import os
import time
import csv
from datetime import datetime
from vidgear.gears import CamGear
from PIL import Image


# Function to capture keyframes and log them with timestamp
def capture_keyframes_and_log(
    stream_url, output_dir="keyframes", log_file="keyframe_log.csv", capture_interval=5
):
    # Create output directory if it doesn't exist
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)

    # Create CSV log file if it doesn't exist
    if not os.path.exists(log_file):
        with open(log_file, mode="w", newline="") as file:
            writer = csv.writer(file)
            writer.writerow(["Image", "Timestamp"])

    # Start video stream from the YouTube live stream link
    stream = CamGear(source=stream_url, stream_mode=True, logging=True).start()

    # Get start time
    start_time = time.time()

    keyframes_info = []

    while True:
        # Read frame from the stream
        frame = stream.read()

        # If the frame is None, break the loop
        if frame is None:
            break

        # Calculate the time difference
        elapsed_time = time.time() - start_time

        # Capture keyframes at specified intervals (e.g., every 5 seconds)
        if elapsed_time >= capture_interval:
            # Get the current timestamp
            timestamp = datetime.now().strftime("%Y-%m-%d_%H-%M-%S")

            # Define the image filename with the timestamp
            image_filename = f"keyframe_{timestamp}.png"
            image_path = os.path.join(output_dir, image_filename)

            # Save the frame as an image
            cv2.imwrite(image_path, frame)

            # Log the image and timestamp to the CSV file
            with open(log_file, mode="a", newline="") as file:
                writer = csv.writer(file)
                writer.writerow([image_filename, timestamp])

            # Add the captured keyframe info
            keyframes_info.append((image_path, timestamp))

            # Update start time for the next interval
            start_time = time.time()

        # Exit after capturing a few keyframes (Streamlit can't run infinite loops easily)
        if len(keyframes_info) >= 100:  # Limit to 5 keyframes for the example
            break

    # Clean up
    stream.stop()

    return keyframes_info


# Streamlit app
st.title("YouTube Live Stream Keyframe Extractor")

# Input for YouTube stream URL
stream_url = st.text_input("Enter YouTube Live Stream URL:")

# Slider to set keyframe capture interval
capture_interval = st.slider(
    "Keyframe Capture Interval (seconds):", min_value=1, max_value=30, value=5
)

# Button to start capturing keyframes
if st.button("Start Capturing Keyframes"):
    if stream_url:
        st.write(f"Starting keyframe extraction from: {stream_url}")

        # Call the function to capture keyframes and log them
        with st.spinner("Capturing keyframes..."):
            keyframes_info = capture_keyframes_and_log(
                stream_url, capture_interval=capture_interval
            )

        # Display captured keyframes with timestamps
        if keyframes_info:
            st.success(f"Captured {len(keyframes_info)} keyframes:")
            for img_path, timestamp in keyframes_info:
                st.image(Image.open(img_path), caption=f"Keyframe at {timestamp}")
        else:
            st.error("No keyframes were captured.")
    else:
        st.error("Please enter a valid YouTube live stream URL.")
