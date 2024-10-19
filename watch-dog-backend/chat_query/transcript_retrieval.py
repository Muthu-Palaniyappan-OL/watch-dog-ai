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

app = Flask(__name__)

# df= None
model_name = "unsloth/Llama-3.2-1B-Instruct"
# model_name = "mlc-ai/Llama-3.2-1B-Instruct-q4f16_1-MLC"
embedding_model = SentenceTransformer('all-MiniLM-L6-v2')
llm_tokenizer = AutoTokenizer.from_pretrained(model_name)
llm_model = AutoModelForCausalLM.from_pretrained(model_name)
# llm_model.half()


@app.route('/')
def hello_world():
    return 'Hello World'

def download_models():
    access_token = "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"
    login(token=access_token)
    model_name = "unsloth/Llama-3.2-1B-Instruct"
    download_directory = "./models/"
    snapshot_download(model_name, cache_dir=download_directory)
    global embedding_model
    embedding_model = SentenceTransformer('all-MiniLM-L6-v2')
    global llm_tokenizer
    llm_tokenizer = AutoTokenizer.from_pretrained(model_name)
    global llm_model
    llm_model = AutoModelForCausalLM.from_pretrained(model_name)
    print("Model and tokenizer loaded successfully.")

def get_transcripts(camera_id):
    url = f'http://127.0.0.1:5000/transcripts/{camera_id}'
    print("Fetching transcripts from server...")

    response = requests.get(url)

    if response.status_code == 200:
        json_responses = response.json()
        data_list = []
        print("Fetched transcripts from server successfully...")

        for json_response in json_responses:
            data = json_response
            context_notes = data['context_notes'].split('; ')
            description = context_notes[0] if len(context_notes) > 0 else ""
            timestamp = context_notes[1].split(': ')[1] if len(context_notes) > 1 else ""

            data_list.append({
                'unusual_activity': data['unusual_activity'],
                'description': description,
                'timestamp': timestamp
            })
        # global df
        df = pd.DataFrame(data_list)
        print("Dataframe generated successfully...")

        df['description_embedding'] = df['description'].apply(
            lambda x: embedding_model.encode(x)).apply(lambda x: np.array(x))

        print("Transcript embeddings generated...")
        return True, df
    else:
        print(f"Failed to fetch data. Status code: {response.status_code}")
        return False

def cosine_similarity(a, b):
    a = np.array(a)
    b = np.array(b)
    return np.dot(a, b.T) / (np.linalg.norm(a) * np.linalg.norm(b, axis=1))

# Search relevant data based on the query
def search(query, df):
    df = df.tail(100)
    query_embedding = embedding_model.encode([query])
    similarities = df['description_embedding'].apply(
        lambda x: cosine_similarity(query_embedding, [x])[0][0])
    top_indices = similarities.nlargest(3).index
    return df.loc[top_indices, ['timestamp', 'description']]

def generate_response(query, df):
    context = ("You are analyzing CCTV footage transcript and answering questions based on both time and observations. "
               "Provide a direct and conversational response based on the timestamps and the exact observations. "
               "Summarize the events into a single cohesive response. Do not add any information that is not present in the transcript.")

    df['description_embedding'] = df['description'].apply(
        lambda x: embedding_model.encode(x)).apply(lambda x: np.array(x))

    # Search for relevant transcript entries
    results = search(query, df)
    print("Search successful...")
    # print(df)
    transcript_info = "\n".join([f"Time: {row['timestamp']} | Description: {row['description']}"
                                 for _, row in results.iterrows()])

    combined_prompt = (f"{context}\n"
                       f"Question: {query}\n"
                       f"Relevant Transcripts:\n{transcript_info}\n"
                       "Please summarize the observations into a single, cohesive, and conversational answer without adding additonal information:")

    # Tokenize and generate the response
    inputs = llm_tokenizer(combined_prompt, return_tensors="pt", padding=True)
    print("Tokenization successful...")
    outputs = llm_model.generate(**inputs, max_length=180, max_new_tokens=20, num_beams=1, temperature=0.2, top_p=0.7, no_repeat_ngram_size=2)
    print("Generation successful...")
    decoded_output = llm_tokenizer.decode(outputs[0], skip_special_tokens=True)
    print("Decode successful...")
    last_newline_index = decoded_output.rfind('\n')
    if last_newline_index != -1:
      result = decoded_output[last_newline_index + 1:]
    return result

@app.route("/get_response", methods=['GET', 'POST'])
def get_response():
    raw_data = request.data.decode('utf-8')
    try:
        json_data = request.get_json(force=True)
        print(json_data)
    except Exception as e:
        return jsonify({"error": "Invalid JSON", "message": str(e)}), 400

    camera_id = json_data["camera_id"]
    q = json_data["question"]
    # print(q)

    transcript = get_transcripts(camera_id)
    if not transcript[0]:
        return jsonify({'error': "Query service temporarily unavailable. Please try after sometime."}), 503
    else:
        df = transcript[1]
        result = generate_response(q, df)
        print(result)
        print(type(result))
        if isinstance(result, set):
            response = list(result)

        return jsonify({'response': result}), 200
    # return jsonify({result}), 200

if __name__ == '__main__':
    app.run(port="5050")
