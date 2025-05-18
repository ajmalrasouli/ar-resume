const OpenAI = require('openai');

module.exports = async function (context, req) {
  // Set default CORS headers for all responses
  const corsHeaders = {
    "Access-Control-Allow-Origin": "https://lemon-desert-05dc5301e.6.azurestaticapps.net",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Vary": "Origin"
  };

  // Handle OPTIONS preflight requests
  if (req.method === "OPTIONS") {
    context.res = {
      status: 204, // No Content
      headers: corsHeaders,
      body: null
    };
    return;
  }

  // Process regular requests
  try {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });

    const { messages, model = "gpt-3.5-turbo", max_tokens = 500, temperature = 0.7 } = req.body;
    
    const completion = await openai.chat.completions.create({
      model,
      messages,
      max_tokens,
      temperature
    });

    context.res = {
      status: 200,
      headers: corsHeaders,
      body: completion
    };
  } catch (error) {
    context.res = {
      status: 500,
      headers: corsHeaders,
      body: {
        error: error.message,
        ...(error.response?.data ? { details: error.response.data } : {})
      }
    };
  }
};