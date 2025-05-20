import requests
import os
import json

api_key = os.getenv("HF_API_KEY")
if not api_key:
    print("Error: HF_API_KEY environment variable not set.")
    exit()

print(f"--- USING KEY: {api_key[:9]}...{api_key[-4:]} ---")

# --- WHOAMI-V2 Test ---
WHOAMI_URL = "https://huggingface.co/api/whoami-v2"
headers_auth_only = {"Authorization": f"Bearer {api_key}"}
try:
    print("\n--- Testing whoami-v2 ---")
    whoami_response = requests.get(WHOAMI_URL, headers=headers_auth_only, timeout=10)
    print(f"whoami-v2 Response Status: {whoami_response.status_code}")
    print(f"whoami-v2 Response Text: {whoami_response.text}")
    if whoami_response.ok:
        try:
            print("whoami-v2 Decoded JSON:", whoami_response.json())
        except json.JSONDecodeError:
            print("whoami-v2 response was OK but not valid JSON.")
except Exception as e:
    print(f"Exception during whoami-v2 test: {e}")


# --- GPT-2 Test (Corrected Endpoint) ---
# THIS IS THE ACTUAL ENDPOINT FOR THE GPT-2 MODEL
ACTUAL_GPT2_API_URL = "https://api-inference.huggingface.co/models/gpt2"
headers_inference = {"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"}

def query_actual_gpt2(text_input):
    # This is a text-generation payload, appropriate for the gpt2 model
    payload = {"inputs": text_input, "parameters": {"max_new_tokens": 20}} # Reduced tokens for faster test
    print(f"\n--- Testing ACTUAL GPT-2 endpoint ({ACTUAL_GPT2_API_URL}) ---")
    print(f"Querying ACTUAL GPT-2 with payload: {json.dumps(payload)}")
    try:
        response = requests.post(ACTUAL_GPT2_API_URL, headers=headers_inference, json=payload, timeout=30) # Increased timeout slightly for model loading
        print(f"ACTUAL GPT-2 Response Status: {response.status_code}")
        print(f"ACTUAL GPT-2 Response Text: {response.text}")
        if response.ok:
            try:
                return response.json()
            except json.JSONDecodeError:
                print("ACTUAL GPT-2 response was OK but not valid JSON.")
                return {"error": "Response OK but not JSON", "details": response.text}
        else:
            # Try to parse error JSON if Hugging Face provides it
            try:
                return response.json() 
            except json.JSONDecodeError:
                return {"error": f"Status {response.status_code}", "details": response.text}
    except requests.exceptions.Timeout:
        print("ACTUAL GPT-2 request timed out.")
        return {"error": "Request timed out"}
    except requests.exceptions.RequestException as e:
        print(f"ACTUAL GPT-2 request exception: {e}")
        return {"error": str(e)}

gpt2_result = query_actual_gpt2("Hello, what is the weather like today?")
print("ACTUAL GPT-2 Full Result:", json.dumps(gpt2_result, indent=2))

if isinstance(gpt2_result, list) and gpt2_result and 'generated_text' in gpt2_result[0]:
    print("ACTUAL GPT-2 Generated Text:", gpt2_result[0]['generated_text'])
elif isinstance(gpt2_result, dict) and 'error' in gpt2_result: # HF errors are often dicts
    print("ACTUAL GPT-2 Error Logged:", gpt2_result['error'])
    if 'details' in gpt2_result:
        print("Error Details:", gpt2_result['details'])


# --- Roberta Q&A Test (This part was already working correctly) ---
ROBERTA_API_URL = "https://api-inference.huggingface.co/models/deepset/roberta-base-squad2"
def query_roberta(payload):
    try:
        response = requests.post(ROBERTA_API_URL, headers=headers_inference, json=payload, timeout=20)
        if response.ok:
            return response.json()
        else:
            print(f"Roberta Error Status: {response.status_code}")
            print(f"Roberta Error Text: {response.text}")
            return {"error": f"Status {response.status_code}", "details": response.text}
    except Exception as e:
        print(f"Roberta request exception: {e}")
        return {"error": str(e)}

def answer_question(question, context_text):
    print(f"\n--- Testing Roberta Q&A ({ROBERTA_API_URL}) ---")
    response = query_roberta({
        "inputs": {
            "question": question,
            "context": context_text
        }
    })
    return response.get('answer', f"Error or no answer: {response}")

question = "What is Hugging Face?"
context_text = "Hugging Face is a company based in New York."
print(f"Roberta Q&A Result for '{question}': {answer_question(question, context_text)}")