import os
import requests
import json
from typing import Dict, Any, Optional

# Get API key from environment variable
api_key = os.getenv("HF_API_KEY")
if not api_key:
    print("Error: HF_API_KEY environment variable not set.")
    exit(1)

# Models to test - Updated with models that work with the new Inference Providers API
MODELS = [
    {
        "id": "deepset/roberta-base-squad2", 
        "name": "Q&A Model", 
        "endpoint": "https://api-inference.huggingface.co/models/deepset/roberta-base-squad2"
    },
    {
        "id": "google/gemma-2-2b-it", 
        "name": "Gemma 2 2B", 
        "endpoint": "https://router.huggingface.co/hf-inference/v3/openai/chat/completions",
        "provider": "hf-inference"
    },
    {
        "id": "deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B", 
        "name": "DeepSeek R1 Distill", 
        "endpoint": "https://router.huggingface.co/hf-inference/v3/openai/chat/completions",
        "provider": "hf-inference"
    },
    {
        "id": "meta-llama/Meta-Llama-3.1-8B-Instruct", 
        "name": "Meta Llama 3.1 8B", 
        "endpoint": "https://router.huggingface.co/hf-inference/v3/openai/chat/completions",
        "provider": "hf-inference"
    },
    {
        "id": "microsoft/phi-4", 
        "name": "Microsoft Phi-4", 
        "endpoint": "https://router.huggingface.co/hf-inference/v3/openai/chat/completions",
        "provider": "hf-inference"
    }
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
            # Q&A model uses the original API format
            payload = {
                "inputs": {
                    "question": "What is the capital of France?",
                    "context": "The capital of France is Paris."
                }
            }
            
            print(f"Sending request to {model['endpoint']}")
            response = requests.post(
                model['endpoint'],
                headers=headers,
                json=payload,
                timeout=15
            )
        else:
            # Text generation models use the new Inference Providers API format
            provider = model.get('provider', 'auto')
            payload = {
                "model": model['id'],
                "messages": [
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                "stream": False
            }
            
            print(f"Sending request to {model['endpoint']} (Provider: {provider})")
            response = requests.post(
                model['endpoint'],
                headers=headers,
                json=payload,
                timeout=30
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
    print("\nNOTE: This script uses the new Hugging Face Inference Providers API for text generation models.")
    print("The API key must have 'Inference Providers' permission enabled.")
    
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
