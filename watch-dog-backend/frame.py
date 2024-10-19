import cv2
import numpy as np
from scenedetect import SceneManager, FrameTimecode
from scenedetect.detectors import HashDetector
from vision import get_caption
# Initialize SceneManager and ContentDetector globally
scene_manager = SceneManager()
scene_manager.add_detector(HashDetector(threshold=0.08))

# Maintain a global frame counter to track which frame is being processed
frame_number = 0

# Define video FPS (frames per second) - adjust FPS to match your video source.
VIDEO_FPS = 30  # Example FPS, replace with actual FPS if known

def process_a_frame(frame):
    global frame_number
    frame_number += 1

    # Use the internal _process_frame to process the current frame
    new_scene_detected = scene_manager._process_frame(frame_number, frame)

    # Check if a scene change was detected
    if new_scene_detected:
        cv2.imwrite(f"./frame/{frame_number}.jpg", frame)
        print(f"Scene change detected at frame {frame_number})")

        # Compress the image (e.g., reduce quality to 80%)
        compression_params = [cv2.IMWRITE_JPEG_QUALITY, 80]
        compressed_frame_path = f"./frame/compressed_{frame_number}.jpg"
        cv2.imwrite(compressed_frame_path, frame, compression_params)
        # Call the get_caption function with the compressed image path
        caption = get_caption(compressed_frame_path)
        print(f"Caption for frame {frame_number}: {caption}")

def test_process_image(image):
    caption = get_caption(image)
    print(f"Caption for frame {frame_number}: {caption}")
