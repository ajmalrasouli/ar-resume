require('dotenv').config(); // For local development with a .env file
const { OpenAI } = require('openai'); // Make sure to install: npm install openai
const rateLimit = require('../lib/rate-limit');

module.exports = async function (context, req) {
  // Set CORS headers for ALL responses
  const corsHeaders = {
    "Access-Control-Allow-Origin": "https://lemon-desert-05dc5301e.6.azurestaticapps.net",
    "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Max-Age": "86400",
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

  // Add Content-Type for non-OPTIONS responses
  corsHeaders["Content-Type"] = "application/json";

  // Main request handling
  try {
    // Get API key from environment variables
    const apiKey = process.env.OPENAI_API_KEY;
    
    // Log API key status (first few and last few characters only for security)
    context.log.info(`[AZURE FUNCTION] OPENAI_API_KEY from environment: ${apiKey ? apiKey.substring(0,6) + "..." + apiKey.substring(apiKey.length - 4) : "NOT SET OR EMPTY"}`);
    
    if (!apiKey) {
      context.log.error("OPENAI_API_KEY is not set in environment variables.");
      context.res = {
        status: 500,
        headers: corsHeaders,
        body: JSON.stringify({ error: "API configuration error on the server. OPENAI_API_KEY not set." })
      };
      return;
    }
    
    // Initialize OpenAI client with API key from environment
    const client = new OpenAI({
      apiKey: apiKey
    });
    
    // Validate request body
    if (!req.body || typeof req.body.inputs !== 'string' || req.body.inputs.trim() === "") {
      context.res = {
        status: 400,
        headers: corsHeaders,
        body: JSON.stringify({ error: "Missing or invalid 'inputs' (must be a non-empty string) in request body" })
      };
      return;
    }

    const { inputs } = req.body;
    const normalizedQuery = inputs.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();

    // Determine if it's a specific Q&A or general chat
    let isGeneralChat = true;
    let qaContextToUse = null;

    // Check if the query matches a specific Q&A context
    const specificQAContexts = {
      "what color is the sky": "The sky is typically blue during the day due to Rayleigh scattering of sunlight.",
      "what colour is the sky": "The sky is typically blue during the day due to Rayleigh scattering of sunlight.",
      "what is the capital of france": "The capital of France is Paris.",
      "who is the president of the united states": "As of my last update, the President of the United States is Joe Biden.",
      "what is the meaning of life": "The meaning of life is a philosophical question with many possible answers, often considered to be about finding purpose and happiness."
    };

    if (specificQAContexts.hasOwnProperty(normalizedQuery)) {
      isGeneralChat = false;
      qaContextToUse = specificQAContexts[normalizedQuery];
      context.log.info(`Input "${inputs}" matched a specific Q&A context. Using direct answer.`);
    } else {
      context.log.info(`Input "${inputs}" did not match specific Q&A contexts. Routing to OpenAI gpt-4o-mini.`);
    }

    let responseBody;

    if (!isGeneralChat) {
      responseBody = { 
        answer: qaContextToUse, 
        score: 1.0, 
        type: 'qa', 
        model: 'direct-qa' 
      };
    } else {
      try {
        context.log.info(`Calling OpenAI gpt-4o-mini for input: "${inputs}"`);
        
        // Set a timeout for the OpenAI call
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('OpenAI API request timed out after 15 seconds')), 15000);
        });
        
        // Make the actual API call
        const apiCallPromise = client.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            { role: "user", content: inputs }
          ],
          max_tokens: 150,
          temperature: 0.7,
          top_p: 0.95,
          frequency_penalty: 0,
          presence_penalty: 0
        });
        
        // Race between the API call and the timeout
        const completion = await Promise.race([apiCallPromise, timeoutPromise]);
        
        if (completion && completion.choices && completion.choices.length > 0) {
          const generatedText = completion.choices[0].message.content.trim();
          context.log.info(`OpenAI gpt-4o-mini responded successfully with ${generatedText.length} characters`);
          
          responseBody = { 
            response: generatedText, 
            type: 'chat', 
            model: 'gpt-4o-mini',
            usage: completion.usage
          };
        } else {
          throw new Error('OpenAI returned an empty or invalid response');
        }
      } catch (error) {
        context.log.error(`Error with OpenAI API: ${error.message}`);
        
        // Fallback response if OpenAI fails
        const fallbackJokes = [
          "Why don't scientists trust atoms? Because they make up everything!",
          "I told my wife she was drawing her eyebrows too high. She looked surprised.",
          "Parallel lines have so much in common. It's a shame they'll never meet.",
          "I'm reading a book about anti-gravity. It's impossible to put down!",
          "Did you hear about the mathematician who's afraid of negative numbers? He'll stop at nothing to avoid them.",
          "Why was the math book sad? Because it had too many problems.",
          "What do you call a fake noodle? An impasta!",
          "Why did the scarecrow win an award? Because he was outstanding in his field!",
          "I would tell you a chemistry joke, but I know I wouldn't get a reaction.",
          "Why don't some couples go to the gym? Because some relationships don't work out."
        ];
        const randomJoke = fallbackJokes[Math.floor(Math.random() * fallbackJokes.length)];
        
        responseBody = { 
          response: `${randomJoke} (This is a fallback response as AI models are currently unavailable. Error: ${error.message.substring(0, 100)})`, 
          type: 'fallback', 
          model: 'fallback-joke' 
        };
      }
    }
    
    // Send the response
    context.res = {
      status: 200,
      headers: corsHeaders,
      body: JSON.stringify(responseBody)
    };
    
  } catch (error) {
    context.log.error(`Unhandled exception in Azure Function: ${error.message}`);
    context.log.error(error.stack);
    
    context.res = {
      status: 500,
      headers: corsHeaders,
      body: JSON.stringify({ 
        error: "An unexpected error occurred on the server", 
        details: error.message 
      })
    };
  }
};