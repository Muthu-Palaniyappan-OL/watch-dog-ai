import cv2
import numpy as np

# Initialize variables
previous_frame = None
keyframe_interval = 30  # Skip frames after detecting a keyframe
frame_counter = 0
min_contour_area = 300  # Minimum contour area to consider movement as significant
cooldown_frames = 90  # Number of frames to skip after detecting a keyframe
cooldown_counter = 0  # Cooldown timer to skip redundant frames


def process_a_frame(frame):
    global previous_frame, frame_counter, cooldown_counter

    # Convert frame to grayscale for easier processing
    gray_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    gray_frame = cv2.GaussianBlur(
        gray_frame, (21, 21), 0
    )  # Apply Gaussian blur to reduce noise

    # Initialize first frame
    if previous_frame is None:
        previous_frame = gray_frame
        return False  # No movement detected on the first frame

    # Compute absolute difference between current frame and previous frame
    frame_diff = cv2.absdiff(previous_frame, gray_frame)

    # Apply a binary threshold to get regions of significant change
    _, thresh = cv2.threshold(frame_diff, 25, 255, cv2.THRESH_BINARY)

    # Dilate the thresholded image to fill in holes, making detection more robust
    thresh = cv2.dilate(thresh, None, iterations=2)

    # Find contours in the thresholded image
    contours, _ = cv2.findContours(
        thresh.copy(), cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE
    )

    # Check if there is any significant movement
    movement_detected = False
    for contour in contours:
        if cv2.contourArea(contour) < min_contour_area:
            continue  # Ignore small movements or noise

        # If a significant contour is found, mark the frame as keyframe
        movement_detected = True
        break

    # Update the previous frame
    previous_frame = gray_frame

    # Handle cooldown to avoid capturing too many frames for the same movement
    if cooldown_counter > 0:
        cooldown_counter -= 1
        return False  # Skip this frame as we're in the cooldown period

    # If movement is detected and not in cooldown, mark as keyframe and start cooldown
    if movement_detected:
        cooldown_counter = cooldown_frames  # Start cooldown
        return True  # Movement detected, this is a keyframe

    return False  # No significant movement detected
