import pandas as pd
import numpy as np
import torch
import re
import json
import requests
from flask import Flask, jsonify, request
from huggingface_hub import login, HfFolder, snapshot_download
from transformers import AutoModel, AutoTokenizer
from sentence_transformers import SentenceTransformer, util
from transformers import AutoTokenizer, AutoModelForSeq2SeqLM, AutoModelForCausalLM
from openai import OpenAI
import os

# app = Flask(__name__)

url = 'https://api.aimlapi.com/v1/chat/completions'
headers = {
        'Authorization': 'Bearer ' + os.getenv('AI_ML_API'),
        'Content-Type': 'application/json',
    }

embedding_model = SentenceTransformer('all-MiniLM-L6-v2')

# @app.route('/')
def hello_world():
    return 'Hello World'

def get_transcripts(camera_id):
    url = f'http://127.0.0.1:5000/transcripts/{camera_id}'
    print("Fetching transcripts from server...")

    response = requests.get(url)

    if response.status_code == 200:
        json_responses = response.json()
        # print(json_responses)
        data_list = []
        print("Fetched transcripts from server successfully...")

        for json_response in json_responses:
            data = json_response
            frame_number = data['frame_number']
            context_notes = data['context_notes'].split('; ')
            description = context_notes[0] if len(context_notes) > 0 else ""
            timestamp = context_notes[1].split(': ')[1] if len(context_notes) > 1 else ""

            data_list.append({
                'unusual_activity': data['unusual_activity'],
                'description': description,
                'timestamp': timestamp,
                'frame_number': frame_number,
            })
        df = pd.DataFrame(data_list)
        print("Dataframe generated successfully...")

        df['description_embedding'] = df['description'].apply(
            lambda x: embedding_model.encode(x)).apply(lambda x: np.array(x))

        print("Transcript embeddings generated...")
        # print(df)
        return True, df
    else:
        print(f"Failed to fetch data. Status code: {response.status_code}")
        return False, None

def cosine_similarity(a, b):
    a = np.array(a)
    b = np.array(b)
    return np.dot(a, b.T) / (np.linalg.norm(a) * np.linalg.norm(b, axis=1))

# Search relevant data based on the query
def search(query, df):
    df = df.tail(100)
    # print(df)
    query_embedding = embedding_model.encode([query])
    similarities = df['description_embedding'].apply(
        lambda x: cosine_similarity(query_embedding, [x])[0][0])
    top_indices = similarities.nlargest(3).index
    return df.loc[top_indices, ['timestamp', 'description', 'frame_number']]

def generate_response(query, df):
    context = ("You are analyzing CCTV footage transcripts and answering questions based on both time and observations. "
               "Provide a direct and conversational response based on the timestamps and the exact observations. Do not mention that you are doing it based on the transcripts explicitly."
               "Summarize the events into a single cohesive response. Do not add any information that is not present in the transcript.")

    df['description_embedding'] = df['description'].apply(
        lambda x: embedding_model.encode(x)).apply(lambda x: np.array(x))

    # Search for relevant transcript entries
    results = search(query, df)
    print("Search successful...")
    # print(results)
    transcript_info = "\n".join([f"Time: {row['timestamp']} | Description: {row['description']}"
                                 for _, row in results.iterrows()])

    frame_number_list = [row['frame_number'] for _, row in results.iterrows()]

    combined_prompt = (f"Question: {query}\n"
                       f"Relevant Transcripts:\n{transcript_info}\n")

    print("Combined prompt : ", combined_prompt)

    client = OpenAI(
    api_key=os.getenv('AI_ML_API'),
    base_url="https://api.aimlapi.com",
    )

    response = client.chat.completions.create(
        model="meta-llama/Llama-3.2-3B-Instruct-Turbo",
        messages=[
            {
            "role": "system",
            "content": f"{context}"
            },
            {
                "role": "user",
                "content": f"{combined_prompt}"
            },
        ],
    )

    outputs = response.choices[0].message.content
    # print(f"Assistant: {outputs}")
    print("Generation successful...")
    result = outputs
    return result, frame_number_list

# @app.route("/get_response", methods=['GET', 'POST'])
def get_response_online(query, camera_id):
    # raw_data = request.data.decode('utf-8')
    # try:
    #     json_data = request.get_json(force=True)
    #     print(json_data)
    # except Exception as e:
    #     return jsonify({"error": "Invalid JSON", "message": str(e)}), 400

    # camera_id = json_data["camera_id"]
    # q = json_data["question"]

    camera_id = camera_id
    q = query
    transcript = get_transcripts(camera_id)
    if not transcript[0]:
        return "Query service temporarily unavailable. Please try after sometime.", []
        # return jsonify({'error': "Query service temporarily unavailable. Please try after sometime."}), 503
    else:
        df = transcript[1]
        result = generate_response(q, df)
        if isinstance(result, set):
            response = list(result)
            
        frame_list = result[1]
        return response, frame_list
        # return jsonify({'camera_id': camera_id, 'response': result[0], 'frame_number': frame_list}), 200
    # return jsonify({result}), 200

# if __name__ == '__main__':
#     app.run(port="5050")
