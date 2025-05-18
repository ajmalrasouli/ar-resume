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

    // Make request to Hugging Face
    const response = await fetch(
      "https://api-inference.huggingface.co/models/facebook/bart-large-cnn",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.HF_API_KEY}`
        },
        body: JSON.stringify({ inputs })
      }
    );

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
    
    context.res = {
      status: 200,
      headers: corsHeaders,
      body: JSON.stringify(data)
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