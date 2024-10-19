import cv2
import numpy as np
from scenedetect import SceneManager, FrameTimecode
from scenedetect.detectors import HashDetector

# Initialize SceneManager and ContentDetector globally
scene_manager = SceneManager()
scene_manager.add_detector(HashDetector(threshold=0.03))

# Maintain a global frame counter to track which frame is being processed
frame_number = 0

# Define video FPS (frames per second) - adjust FPS to match your video source.
VIDEO_FPS = 30  # Example FPS, replace with actual FPS if known


def process_a_frame(frame):
    global frame_number
    frame_number += 1

    # Create a FrameTimecode object based on the current frame number and video FPS
    timecode = FrameTimecode(frame_number, fps=VIDEO_FPS)

    # Use the internal _process_frame to process the current frame
    new_scene_detected = scene_manager._process_frame(frame_number, frame)

    # Check if a scene change was detected
    if new_scene_detected:
        cv2.imwrite(f"./frame/{frame_number}.jpg", frame)
        print(f"Scene change detected at frame {frame_number} (timecode: {timecode})")
