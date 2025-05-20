import time
import requests
import os
api_key = os.getenv("HF_API_KEY")

API_URL = "https://api-inference.huggingface.co/models/deepset/roberta-base-squad2"
headers = {"Authorization": f"Bearer {api_key}"}  # Replace YOUR_API_KEY with your actual key

def query(payload):
    response = requests.post(API_URL, headers=headers, json=payload)
    return response.json()

def ner(text):
    while True:
        response = query({"inputs": text})
        if 'error' in response and 'loading' in response['error']:
            print(response['error'])
            time.sleep(10)  # Wait for 10 seconds before retrying
        else:
            return response


def answer_question(question, context):
    response = query({
        "inputs": {
            "question": question,
            "context": context
        }
    })
    return response['answer']

question = "What is Hugging Face?"
context = "Hugging Face is a company based in New York."
print(answer_question(question, context))