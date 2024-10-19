import requests
import base64
from dotenv import load_dotenv
import json
import cv2
from flask import current_app
from db import TranscriptDetailed, db, app
import os


def image_path_to_image_b64(image_path):
    with open(image_path, "rb") as f:
        return base64.b64encode(f.read()).decode()


def ndarray_to_image_b64(image_arr):
    _, buffer = cv2.imencode(".jpg", image_arr, [int(cv2.IMWRITE_JPEG_QUALITY), 50])
    return base64.b64encode(buffer).decode("utf-8")


async def get_caption(image_b64, frame_number, camera_id):
    invoke_url = "https://ai.api.nvidia.com/v1/gr/meta/llama-3.2-90b-vision-instruct/chat/completions"
    stream = False
    api_token = os.getenv("NVIDIA_API_TOKEN")
    # Read the image and encode it to base64

    assert (
        len(image_b64) < 180_000
    ), "To upload larger images, use the assets API (see docs)"

    headers = {
        "Authorization": "Bearer " + api_token,
        "Accept": "text/event-stream" if stream else "application/json",
    }

    payload = {
        "model": "meta/llama-3.2-90b-vision-instruct",
        "messages": [
            {
                "role": "user",
                "content": f'Analyze this CCTV footage and generate an objective report in JSON format with the following fields: unusual_activity: Describe any unusual or suspicious activity observed, or respond with none if no such activity is detected. human_activity: Objectively describe human movements or behaviors observed in the footage, or respond with none if no human activity is detected. animal_activity: If any animals or birds are present, describe their movements or behaviors, or respond with none if no wildlife is detected. time: Specify whether the footage is captured during day or night based on lighting conditions. unusual_crowd: If there is an unusually large group of people, respond with unusual crowd, otherwise respond with none. lighting_conditions: Detail the lighting (e.g., well-lit, dim). vehicle_details: If vehicles are detected, describe them (e.g., red sedan). number_of_individuals: Provide the estimated number of people present (e.g., 3). object_presence: Describe any significant objects present (e.g., backpack left unattended). context_notes: Add any additional observations that provide context (e.g., event in progress). The output should be in valid JSON format only no extra words. <img src="data:image/png;base64,{image_b64}" />',
            }
        ],
        "max_tokens": 512,
        "temperature": 0.4,
        "top_p": 1.00,
        "stream": stream,
    }

    # Send POST request to the API
    response = requests.post(invoke_url, headers=headers, json=payload)

    if stream:
        # Handle streaming responses
        for line in response.iter_lines():
            if line:
                print(line.decode("utf-8"))
    else:
        # Parse the JSON response
        json_response = response.json()

        # Extract the content
        content = json_response["choices"][0]["message"]["content"]

        # Clean and parse the content into a dictionary
        try:
            # Convert string content to dictionary
            cleaned_output = json.loads(content)

            with app.app_context():
                try:
                    # {"unusual_activity": "none", "human_activity": "People walking on the sidewalk, some carrying bags or backpacks. A few individuals are standing near the street, possibly waiting for something or someone.", "animal_activity": "none", "time": "day", "unusual_crowd": "none", "lighting_conditions": "well-lit", "vehicle_details": "none", "number_of_individuals": "approximately 10-15", "object_presence": "none", "context_notes": "The scene appears to be a typical urban setting with people going about their daily business. There are no visible signs of distress or unusual behavior among the individuals present."}
                    data = TranscriptDetailed()
                    data.camera_id = camera_id
                    data.frame_number = frame_number
                    data.unusual_activity = cleaned_output["unusual_activity"]
                    data.human_activity = cleaned_output["human_activity"]
                    data.animal_activity = cleaned_output["animal_activity"]
                    data.time = cleaned_output["time"]
                    data.unusual_crowd = cleaned_output["unusual_crowd"]
                    data.lighting_conditions = cleaned_output["lighting_conditions"]
                    data.vehicle_details = cleaned_output["vehicle_details"]
                    data.number_of_individuals = cleaned_output["number_of_individuals"]
                    data.object_presence = cleaned_output["object_presence"]
                    data.context_notes = cleaned_output["context_notes"]
                    db.session.add(data)
                    db.session.commit()
                except Exception as e:
                    db.session.rollback()  # Rollback the session in case of error
                    print(f"Error: {e}")

            return cleaned_output
        except json.JSONDecodeError as e:
            print(f"Error decoding JSON: {e}")
            return {}
