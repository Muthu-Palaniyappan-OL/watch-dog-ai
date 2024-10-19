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

access_token = "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"
login(token=access_token)
model_name = "unsloth/Llama-3.2-1B-Instruct"
# model_name = "mlc-ai/Llama-3.2-1B-Instruct-q4f16_1-MLC"
download_directory = "./models/"
snapshot_download(model_name, cache_dir=download_directory)