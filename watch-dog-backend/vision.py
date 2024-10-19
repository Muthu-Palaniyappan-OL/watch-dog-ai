import requests
import base64
from dotenv import load_dotenv
import json
import os


def get_caption(image_path):
    invoke_url = "https://ai.api.nvidia.com/v1/gr/meta/llama-3.2-90b-vision-instruct/chat/completions"
    stream = False
    api_token = os.getenv("NVIDIA_API_TOKEN")
    # Read the image and encode it to base64
    with open(image_path, "rb") as f:
        image_b64 = base64.b64encode(f.read()).decode()

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
        "temperature": 0.5,
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
            return cleaned_output
        except json.JSONDecodeError as e:
            print(f"Error decoding JSON: {e}")
            return {}
