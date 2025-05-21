from openai import OpenAI

# Use the same project-specific API key that works in the other script
client = OpenAI(
  api_key=""
)

def test_model(model_id, prompt="What is in your mind?"):
    """Test a single model with the given prompt"""
    print(f"\n{'='*80}")
    print(f"Testing model: {model_id}")
    
    try:
        # Create a chat completion using the OpenAI SDK
        completion = client.chat.completions.create(
            model=model_id,
            messages=[
                {"role": "user", "content": prompt}
            ],
            max_tokens=50
        )
        
        # Print the response
        print("Response:")
        print(f"Content: {completion.choices[0].message.content}")
        print(f"Finish reason: {completion.choices[0].finish_reason}")
        print(f"Prompt tokens: {completion.usage.prompt_tokens}")
        print(f"Completion tokens: {completion.usage.completion_tokens}")
        print(f"Total tokens: {completion.usage.total_tokens}")
        
        return {"status": "success", "response": completion}
        
    except Exception as e:
        error_msg = f"Error testing model {model_id}: {str(e)}"
        print(error_msg)
        return {"status": "error", "error": str(e)}

def main():
    # Only include gpt-4o-mini as requested
    MODELS = ["gpt-4o-mini"]
    
    print(f"Testing OpenAI API with SDK and project-specific key")
    print(f"API Key: sk-proj-...{client.api_key[-4:]}")
    
    # Test each model
    results = {}
    for model_id in MODELS:
        results[model_id] = test_model(model_id)
    
    # Print summary
    print("\n" + "="*80)
    print("TEST SUMMARY:")
    for model_id, result in results.items():
        status = result.get("status", "unknown")
        print(f"{model_id}: {status.upper()}")

if __name__ == "__main__":
    main()
