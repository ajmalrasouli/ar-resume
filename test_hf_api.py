import os
import requests
import json
from typing import Dict, Any, Optional

# Get API key from environment variable
api_key = os.getenv("HF_API_KEY")
if not api_key:
    print("Error: HF_API_KEY environment variable not set.")
    exit(1)

# Models to test
MODELS = [
    {"id": "gpt2", "name": "GPT-2", "endpoint": "https://api-inference.huggingface.co/models/gpt2"},
    {"id": "EleutherAI/gpt-neo-125m", "name": "GPT-Neo 125M", "endpoint": "https://api-inference.huggingface.co/models/EleutherAI/gpt-neo-125m"},
    {"id": "facebook/opt-125m", "name": "OPT 125M", "endpoint": "https://api-inference.huggingface.co/models/facebook/opt-125m"},
    {"id": "sshleifer/tiny-gpt2", "name": "Tiny GPT-2", "endpoint": "https://api-inference.huggingface.co/models/sshleifer/tiny-gpt2"},
    {"id": "deepset/roberta-base-squad2", "name": "Q&A Model", "endpoint": "https://api-inference.huggingface.co/models/deepset/roberta-base-squad2"}
]

def test_model(model: Dict[str, str], prompt: str = "Hello, how are you?") -> Dict[str, Any]:
    """Test a single model with the given prompt"""
    headers = {"Authorization": f"Bearer {api_key}"}
    
    print(f"\n{'='*80}")
    print(f"Testing model: {model['name']} ({model['id']})")
    print(f"Endpoint: {model['endpoint']}")
    
    try:
        # Prepare payload based on model type
        if model['id'] == 'deepset/roberta-base-squad2':
            payload = {
                "inputs": {
                    "question": "What is the capital of France?",
                    "context": "The capital of France is Paris."
                }
            }
        else:
            payload = {
                "inputs": prompt,
                "parameters": {
                    "max_new_tokens": 50,
                    "return_full_text": False
                }
            }
        
        print(f"Sending request to {model['endpoint']}")
        response = requests.post(
            model['endpoint'],
            headers=headers,
            json=payload,
            timeout=15
        )
        
        print(f"Status Code: {response.status_code}")
        
        # Try to parse JSON response
        try:
            result = response.json()
            print("Response:")
            print(json.dumps(result, indent=2))
            return {"status": "success", "status_code": response.status_code, "response": result}
            
        except ValueError:
            print(f"Failed to parse JSON. Raw response: {response.text}")
            return {"status": "error", "status_code": response.status_code, "error": "Invalid JSON response"}
            
    except Exception as e:
        error_msg = f"Error testing model {model['name']}: {str(e)}"
        print(error_msg)
        return {"status": "error", "error": str(e)}

def main():
    if not api_key:
        print("Error: HF_API_KEY environment variable not set.")
        return
    
    print(f"Testing Hugging Face API with key: {api_key[:6]}...{api_key[-4:]}")
    
    # Test each model
    results = {}
    for model in MODELS:
        results[model['id']] = test_model(model)
    
    # Print summary
    print("\n" + "="*80)
    print("TEST SUMMARY:")
    for model_id, result in results.items():
        status = result.get('status', 'unknown')
        print(f"{model_id}: {status.upper()}")

if __name__ == "__main__":
    main()