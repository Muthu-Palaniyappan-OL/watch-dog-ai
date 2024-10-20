import cv2
import numpy as np
from scenedetect import SceneManager, FrameTimecode
from scenedetect.detectors import HashDetector
from vision import get_caption
import asyncio
from vision import ndarray_to_image_b64

# Initialize SceneManager and ContentDetector globally
scene_manager = SceneManager()
scene_manager.add_detector(HashDetector(threshold=0.03))

# Maintain a global frame counter to track which frame is being processed
frame_number = 0

# Define video FPS (frames per second) - adjust FPS to match your video source.
VIDEO_FPS = 30  # Example FPS, replace with actual FPS if known


def process_a_frame(frame, loop, camera_id):
    global frame_number
    frame_number += 1

    # Use the internal _process_frame to process the current frame
    new_scene_detected = scene_manager._process_frame(frame_number, frame)

    # Check if a scene change was detected
    if new_scene_detected:
        print(f"Scene change detected at frame {frame_number})")

        # Compress the image (e.g., reduce quality to 80%)
        asyncio.run_coroutine_threadsafe(
            get_caption(ndarray_to_image_b64(frame), frame_number, camera_id), loop
        )
        print(f"Caption for frame {frame_number}")


def test_process_image(image_path):
    # compression_params = [cv2.IMWRITE_PNG_COMPRESSION, 80]
    # compressed_frame_path = f"./frame/" + image_path
    # cv2.imwrite(compressed_frame_path, compressed_frame_path, compression_params)
    # caption = get_caption(image_path)
    # print(f"Caption for frame {frame_number}: {caption}")
    pass
