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
      // Use a text generation model for general chat
      modelUsed = 'gpt2';
      response = await fetch(
        "https://api-inference.huggingface.co/models/gpt2",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${process.env.HF_API_KEY}`
          },
          body: JSON.stringify({
            inputs: inputs,
            parameters: {
              max_length: 100,
              temperature: 0.7
            }
          })
        }
      );
    } else {
      // Use Q&A model for specific questions
      modelUsed = 'deepset/roberta-base-squad2';
      const payload = {
        inputs: {
          question: inputs,
          context: "You are a helpful AI assistant. Please provide accurate and helpful responses to questions."
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
    const data = await response.json();
    let responseBody;
    
    // Format response based on model used
    if (isGeneralChat) {
      // For chat model, return the generated text
      responseBody = {
        response: data[0]?.generated_text || "I'm sorry, I couldn't generate a response.",
        type: 'chat',
        model: modelUsed
      };
    } else {
      // For Q&A model, format the answer
      responseBody = {
        answer: data.answer || "I'm not sure how to answer that.",
        score: data.score || 0,
        type: 'qa',
        model: modelUsed
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