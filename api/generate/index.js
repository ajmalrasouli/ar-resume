require('dotenv').config();
const fetch = require('node-fetch');

module.exports = async function (context, req) {
  // Set CORS headers for ALL responses
  const corsHeaders = {
    "Access-Control-Allow-Origin": "https://lemon-desert-05dc5301e.6.azurestaticapps.net",
    "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Max-Age": "86400",
    "Content-Type": "application/json" // Set content type to JSON for all responses
  };

  // Handle OPTIONS preflight
  if (req.method === "OPTIONS") {
    context.res = {
      status: 204, // No content
      headers: corsHeaders,
      body: null
    };
    return;
  }

  // Main request handling
  try {
    // Validate input
    if (!req.body || !req.body.inputs) {
      context.res = {
        status: 400,
        headers: corsHeaders,
        body: JSON.stringify({ error: "Missing required 'inputs' in request body" })
      };
      return;
    }

    const { inputs } = req.body;
    
    // Check if API key is set
    if (!process.env.HF_API_KEY) {
      context.log.error("HF_API_KEY is not set in environment variables");
      context.res = {
        status: 500,
        headers: corsHeaders,
        body: JSON.stringify({ error: "API configuration error" })
      };
      return;
    }

    // Determine if the input is a general chat or a specific question
    const isGeneralChat = !inputs.endsWith('?') && !inputs.toLowerCase().startsWith('what') && !inputs.toLowerCase().startsWith('who') && !inputs.toLowerCase().startsWith('when') && !inputs.toLowerCase().startsWith('where') && !inputs.toLowerCase().startsWith('why') && !inputs.toLowerCase().startsWith('how');
    
    let response;
    let modelUsed = '';

    if (isGeneralChat) {
      // Try different chat models in sequence if one fails
      const chatModels = [
        { id: 'gpt2', name: 'GPT-2' },
        { id: 'distilgpt2', name: 'DistilGPT-2' },
        { id: 'microsoft/DialoGPT-small', name: 'DialoGPT' },
        { id: 'facebook/opt-350m', name: 'OPT-350M' }
      ];
      
      let lastError;
      let lastStatus;
      
      // First, check if the API key is valid by making a simple request
      try {
        const testResponse = await fetch('https://huggingface.co/api/whoami-v2', {
          headers: { 'Authorization': `Bearer ${process.env.HF_API_KEY}` }
        });
        
        if (!testResponse.ok) {
          context.log.warn('Hugging Face API key validation failed:', await testResponse.text());
        } else {
          const userInfo = await testResponse.json();
          context.log.info(`Connected to Hugging Face as: ${userInfo.name || 'API User'}`);
        }
      } catch (error) {
        context.log.warn('Could not verify Hugging Face API key:', error.message);
      }
      
      // Try each model
      for (const model of chatModels) {
        modelUsed = model.id;
        context.log.info(`Trying model: ${model.name} (${model.id})`);
        
        try {
          const startTime = Date.now();
          const modelResponse = await fetch(
            `https://api-inference.huggingface.co/models/${model.id}`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${process.env.HF_API_KEY}`,
                "X-Wait-For-Model": "true"  // Wait if model is loading
              },
              body: JSON.stringify({
                inputs: inputs,
                parameters: {
                  max_length: 100,
                  temperature: 0.7,
                  return_full_text: false
                }
              })
            }
          );
          
          const responseTime = Date.now() - startTime;
          lastStatus = modelResponse.status;
          
          if (modelResponse.ok) {
            context.log.info(`Model ${model.name} responded successfully in ${responseTime}ms`);
            response = modelResponse;
            break;
          }
          
          const errorData = await modelResponse.text();
          lastError = new Error(`Model ${model.name} (${model.id}) returned ${modelResponse.status}: ${errorData}`);
          context.log.warn(`Chat model ${model.name} failed in ${responseTime}ms:`, lastError.message);
          
        } catch (error) {
          lastError = error;
          context.log.warn(`Error with model ${model.name}:`, error.message);
          continue;
        }
      }
      
      if (!response) {
        context.log.warn('All chat models failed, using fallback response');
        const fallbackJokes = [
          "Why don't scientists trust atoms? Because they make up everything!",
          "Did you hear about the mathematician who's afraid of negative numbers? He'll stop at nothing to avoid them!",
          "Why don't eggs tell jokes? They'd crack each other up!",
          "I told my wife she was drawing her eyebrows too high. She looked surprised.",
          "What's the best thing about Switzerland? I don't know, but the flag is a big plus!"
        ];
        
        const randomJoke = fallbackJokes[Math.floor(Math.random() * fallbackJokes.length)];
        const errorMessage = lastError ? ` (Error: ${lastError.message.split(':')[0]})` : '';
        
        // Provide a fallback response
        response = {
          ok: true,
          json: async () => [{
            generated_text: `${randomJoke} (This is a fallback response since all AI models are currently unavailable.${errorMessage})`
          }]
        };
      }
    } else {
      // Use Q&A model for specific questions
      modelUsed = 'deepset/roberta-base-squad2';
      const context = {
        "what color is the sky": "The sky is typically blue during the day due to Rayleigh scattering of sunlight.",
        "what colour is the sky": "The sky is typically blue during the day due to Rayleigh scattering of sunlight.",
        "what is the capital of france": "The capital of France is Paris.",
        "who is the president of the united states": "As of my last update, the President of the United States is Joe Biden.",
        "what is the meaning of life": "The meaning of life is a philosophical question with many possible answers, often considered to be about finding purpose and happiness."
      };

      const question = inputs.toLowerCase().replace(/[^a-z0-9\s]/g, '');
      const defaultContext = "You are a helpful AI assistant. Please provide accurate and helpful responses to questions.";
      
      const payload = {
        inputs: {
          question: inputs,
          context: context[question] || defaultContext
        }
      };
      
      response = await fetch(
        `https://api-inference.huggingface.co/models/${modelUsed}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${process.env.HF_API_KEY}`
          },
          body: JSON.stringify(payload)
        }
      );
    }

    // Check if the response is ok before trying to parse
    if (!response.ok) {
      const errorText = await response.text();
      context.log.error(`Hugging Face API error: ${response.status} ${response.statusText} - ${errorText}`);
      
      context.res = {
        status: response.status,
        headers: corsHeaders,
        body: JSON.stringify({ 
          error: `Hugging Face API returned ${response.status} ${response.statusText}`,
          details: errorText
        })
      };
      return;
    }

    // Parse successful response
    let responseBody;
    
    try {
      const data = await response.json();
      
      // Format response based on model used
      if (isGeneralChat) {
        // For chat model, clean up the response
        let generatedText = '';
        if (Array.isArray(data) && data[0]?.generated_text) {
          generatedText = data[0].generated_text;
        } else if (typeof data === 'object' && data.generated_text) {
          generatedText = data.generated_text;
        } else if (typeof data === 'string') {
          generatedText = data;
        }
        
        // Clean up the response text
        generatedText = generatedText
          .replace(/^\s*\n+/, '') // Remove leading newlines
          .replace(/\n+/g, ' ')     // Replace multiple newlines with space
          .trim();
          
        responseBody = {
          response: generatedText || "I'm sorry, I couldn't generate a response.",
          type: 'chat',
          model: modelUsed
        };
      } else {
      // For Q&A model, check confidence score
      const MIN_CONFIDENCE = 0.1; // Minimum confidence score to trust the Q&A answer
      
      if ((data.score || 0) < MIN_CONFIDENCE) {
        // If confidence is too low, fall back to chat model
        modelUsed = 'gpt2';
        const chatResponse = await fetch(
          "https://api-inference.huggingface.co/models/gpt2",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${process.env.HF_API_KEY}`
            },
            body: JSON.stringify({
              inputs: inputs,
              parameters: { max_length: 100, temperature: 0.7 }
            })
          }
        );
        
        if (chatResponse.ok) {
          const chatData = await chatResponse.json();
          responseBody = {
            response: chatData[0]?.generated_text || "I'm not sure how to respond to that.",
            type: 'chat',
            model: modelUsed,
            fallback: true,
            original_score: data.score
          };
        } else {
          // If chat model also fails, return the original low-confidence answer
          responseBody = {
            answer: data.answer || "I'm not sure how to answer that.",
            score: data.score || 0,
            type: 'qa',
            model: modelUsed,
            note: 'Low confidence answer'
          };
        }
      } else {
        // If confidence is good, return Q&A response
        responseBody = {
          answer: data.answer || "I'm not sure how to answer that.",
          score: data.score || 0,
          type: 'qa',
          model: modelUsed
        };
      }
    }
    } catch (error) {
      context.log.error('Error parsing response:', error);
      responseBody = {
        response: "I'm sorry, I encountered an error processing your request.",
        type: 'error',
        error: error.message
      };
    }
    
    context.res = {
      status: 200,
      headers: corsHeaders,
      body: JSON.stringify(responseBody)
    };
  } catch (error) {
    // Log the full error for debugging
    context.log.error(`Unhandled error: ${error.message}`);
    context.log.error(error.stack);
    
    context.res = {
      status: 500,
      headers: corsHeaders,
      body: JSON.stringify({
        error: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      })
    };
  }
};