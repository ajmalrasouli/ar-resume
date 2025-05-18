const OpenAI = require('openai');

module.exports = async function (context, req) {
  // Set CORS headers for all responses
  context.res = {
    headers: {
      "Access-Control-Allow-Origin": "https://lemon-desert-05dc5301e.6.azurestaticapps.net",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Content-Type": "application/json"
    }
  };

  // Handle preflight
  if (req.method === "OPTIONS") {
    return context.done();
  }

  // Main logic
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
      ...context.res,
      status: 200,
      body: completion
    };
  } catch (error) {
    context.res = {
      ...context.res,
      status: 500,
      body: {
        error: error.message,
        ...(error.response?.data ? { details: error.response.data } : {})
      }
    };
  }
};