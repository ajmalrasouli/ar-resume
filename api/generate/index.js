const OpenAI = require('openai');

module.exports = async function (context, req) {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    context.res = {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type"
      }
    };
    return;
  }

  // Initialize OpenAI
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });

  try {
    const { messages, model = "gpt-3.5-turbo", max_tokens = 500, temperature = 0.7 } = req.body;
    
    const completion = await openai.chat.completions.create({
      model,
      messages,
      max_tokens,
      temperature
    });

    context.res = {
      status: 200,
      body: completion
    };
  } catch (error) {
    context.res = {
      status: 500,
      body: {
        error: error.message,
        ...(error.response?.data ? { details: error.response.data } : {})
      }
    };
  }
};