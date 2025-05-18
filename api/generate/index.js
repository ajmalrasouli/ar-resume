const fetch = require('node-fetch');

module.exports = async function (context, req) {
  // Set CORS headers
  const headers = {
    "Access-Control-Allow-Origin": "https://lemon-desert-05dc5301e.6.azurestaticapps.net",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  };

  // Handle preflight requests
  if (req.method === "OPTIONS") {
    context.res = { status: 204, headers };
    return;
  }

  try {
    const { inputs } = req.body;
    
    const response = await fetch(
      "https://api-inference.huggingface.co/models/google/flan-t5-xl", // Free model
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.HF_API_KEY}`
        },
        body: JSON.stringify({ inputs })
      }
    );

    const data = await response.json();
    
    context.res = {
      status: 200,
      headers,
      body: data
    };
  } catch (error) {
    context.res = {
      status: 500,
      headers,
      body: { 
        error: error.message,
        details: error.stack 
      }
    };
  }
};