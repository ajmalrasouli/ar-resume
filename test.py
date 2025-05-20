import requests
import os
import json

api_key = os.getenv("HF_API_KEY")
if not api_key:
    print("Error: HF_API_KEY environment variable not set.")
    exit()

GPT2_API_URL = "https://api-inference.huggingface.co/models/gpt2"
headers = {"Authorization": f"Bearer {api_key}"}

def query_gpt2(text_input):
    payload = {"inputs": text_input, "parameters": {"max_new_tokens": 50}}
    print(f"Querying GPT-2 with payload: {json.dumps(payload)}")
    print(f"Using API Key: {api_key[:9]}...") # Truncated key
    response = requests.post(GPT2_API_URL, headers=headers, json=payload)
    print(f"GPT-2 Response Status: {response.status_code}")
    print(f"GPT-2 Response Text: {response.text}")
    return response.json()

print("\n--- Testing GPT-2 ---")
gpt2_result = query_gpt2("Hello, what is the weather like today?")
print("GPT-2 Full Result:", json.dumps(gpt2_result, indent=2))
if isinstance(gpt2_result, list) and gpt2_result and 'generated_text' in gpt2_result[0]:
    print("GPT-2 Generated Text:", gpt2_result[0]['generated_text'])
elif 'error' in gpt2_result:
    print("GPT-2 Error:", gpt2_result['error'])

# Keep your roberta test as well for comparison
ROBERTA_API_URL = "https://api-inference.huggingface.co/models/deepset/roberta-base-squad2"
def query_roberta(payload):
    response = requests.post(ROBERTA_API_URL, headers=headers, json=payload)
    return response.json()

def answer_question(question, context_text):
    response = query_roberta({
        "inputs": {
            "question": question,
            "context": context_text
        }
    })
    return response.get('answer', f"Error or no answer: {response}")


print("\n--- Testing Roberta Q&A ---")
question = "What is Hugging Face?"
context_text = "Hugging Face is a company based in New York."
print(f"Roberta Q&A Result for '{question}': {answer_question(question, context_text)}")