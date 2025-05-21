import os
import requests
import json
from typing import Dict, Any, Optional

# Get API key from environment variable
api_key = os.getenv("OPENAI_API_KEY")
if not api_key:
    print("Error: OPENAI_API_KEY environment variable not set.")
    exit(1)

# Models to test
MODELS = [
    {"id": "gpt-3.5-turbo", "name": "GPT-3.5 Turbo", "endpoint": "https://api.openai.com/v1/chat/completions"},
    {"id": "gpt-4o", "name": "GPT-4o", "endpoint": "https://api.openai.com/v1/chat/completions"},
    {"id": "gpt-4-turbo", "name": "GPT-4 Turbo", "endpoint": "https://api.openai.com/v1/chat/completions"},
    {"id": "text-embedding-3-small", "name": "Text Embedding", "endpoint": "https://api.openai.com/v1/embeddings"}
]

def test_model(model: Dict[str, str], prompt: str = "Hello, how are you?") -> Dict[str, Any]:
    """Test a single model with the given prompt"""
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    
    print(f"\n{'='*80}")
    print(f"Testing model: {model['name']} ({model['id']})")
    print(f"Endpoint: {model['endpoint']}")
    
    try:
        # Prepare payload based on model type
        if model['endpoint'].endswith('/embeddings'):
            payload = {
                "model": model['id'],
                "input": prompt
            }
        else:
            payload = {
                "model": model['id'],
                "messages": [
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                "max_tokens": 50
            }
        
        print(f"Sending request to {model['endpoint']}")
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
            # For large responses, just show a summary
            if model['endpoint'].endswith('/embeddings') and 'data' in result:
                embedding_count = len(result['data'][0]['embedding'])
                result['data'][0]['embedding'] = f"[{embedding_count} values]"
            
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
        print("Error: OPENAI_API_KEY environment variable not set.")
        return
    
    print(f"Testing OpenAI API with key: {api_key[:6]}...{api_key[-4:]}")
    
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
