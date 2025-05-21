require('dotenv').config(); // For local development with a .env file
const { OpenAI } = require('openai'); // Make sure to install: npm install openai

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

    // Keep the specific Q&A contexts for direct answers
    const specificQAContexts = {
      "what color is the sky": "The sky is typically blue during the day due to Rayleigh scattering of sunlight.",
      "what colour is the sky": "The sky is typically blue during the day due to Rayleigh scattering of sunlight.",
      "what is the capital of france": "The capital of France is Paris.",
      "who is the president of the united states": "As of my last update, the President of the United States is Joe Biden.",
      "what is the meaning of life": "The meaning of life is a philosophical question with many possible answers, often considered to be about finding purpose and happiness."
    };

    // Code-related keywords and patterns to detect coding questions
    const codeKeywords = [
      'code', 'function', 'programming', 'algorithm', 'syntax', 'compile', 'debug',
      'javascript', 'python', 'java', 'c++', 'c#', 'ruby', 'php', 'swift', 'kotlin', 'rust', 'go',
      'html', 'css', 'sql', 'database', 'api', 'json', 'xml', 'regex', 'git', 'github',
      'array', 'string', 'object', 'class', 'method', 'variable', 'loop', 'conditional',
      'print', 'console.log', 'import', 'require', 'module', 'package', 'library', 'framework'
    ];

    // Common programming language patterns
    const codePhrasePatterns = [
      /how (do|to|can) I.*in (javascript|python|java|c\+\+|c#|ruby|php|swift|kotlin|rust|go)/i,
      /how (do|to|can) I (create|implement|build|write|code|program)/i,
      /what('s| is) the (syntax|code|function|method) (for|to)/i,
      /explain.*(code|function|method|class|algorithm)/i,
      /debug.*(code|function|error|problem)/i,
      /write (a|an|the).*(function|code|program|script)/i,
      /convert.*(code|function|algorithm)/i,
      /optimize.*(code|function|algorithm|performance)/i
    ];

    // Determine query type: specific Q&A, code assistant, or general chat
    let queryType = 'general';
    let qaContextToUse = null;
    
    // Check if it's a specific Q&A
    if (specificQAContexts.hasOwnProperty(normalizedQuery)) {
      queryType = 'qa';
      qaContextToUse = specificQAContexts[normalizedQuery];
      context.log.info(`Input "${inputs}" matched a specific Q&A context. Using direct answer.`);
    } 
    // Check if it's a code-related question
    else if (
      // Check for code keywords
      codeKeywords.some(keyword => normalizedQuery.includes(keyword)) ||
      // Check for code phrase patterns
      codePhrasePatterns.some(pattern => pattern.test(inputs))
    ) {
      queryType = 'code';
      context.log.info(`Input "${inputs}" detected as a code-related question. Routing to Code Assistant.`);
    }
    // Otherwise, it's a general chat
    else {
      context.log.info(`Input "${inputs}" routed to general chat.`);
    }
    
    let responseBody;
    
    // Handle based on query type
    if (queryType === 'qa') {
      // Direct answer from predefined Q&A
      responseBody = { 
        answer: qaContextToUse, 
        score: 1.0, 
        type: 'qa', 
        model: 'direct-qa' 
      };
    } 
    else {
      // For both code and general queries, use OpenAI but with different prompts
      try {
        context.log.info(`Calling OpenAI gpt-4o-mini for ${queryType} query: "${inputs}"`);
        
        // Set a timeout for the OpenAI call
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('OpenAI API request timed out after 15 seconds')), 15000);
        });
        
        // Prepare messages based on query type
        let messages = [];
        
        if (queryType === 'code') {
          // Specialized system prompt for code assistant
          messages = [
            { 
              role: "system", 
              content: "You are a helpful code assistant specialized in programming and software development. Provide clear, concise, and accurate code examples and explanations. When showing code, use proper formatting and include comments to explain key parts. If asked to write code, provide working solutions with explanations of how the code works. Focus on best practices and efficient solutions."
            },
            { role: "user", content: inputs }
          ];
        } else {
          // Simple prompt for general chat
          messages = [
            { role: "user", content: inputs }
          ];
        }
        
        // Make the actual API call
        const apiCallPromise = client.chat.completions.create({
          model: "gpt-4o-mini",
          messages: messages,
          max_tokens: queryType === 'code' ? 500 : 150, // Allow longer responses for code
          temperature: queryType === 'code' ? 0.3 : 0.7, // Lower temperature for more precise code
          top_p: 0.95,
          frequency_penalty: 0,
          presence_penalty: 0
        });
        
        // Race between the API call and the timeout
        const completion = await Promise.race([apiCallPromise, timeoutPromise]);
        
        if (completion && completion.choices && completion.choices.length > 0) {
          const generatedText = completion.choices[0].message.content.trim();
          context.log.info(`OpenAI gpt-4o-mini responded successfully with ${generatedText.length} characters for ${queryType} query`);
          
          responseBody = { 
            response: generatedText, 
            type: queryType, // 'code' or 'general'
            model: 'gpt-4o-mini',
            usage: completion.usage
          };
        } else {
          throw new Error('OpenAI returned an empty or invalid response');
        }
      } catch (error) {
        context.log.error(`Error with OpenAI API for ${queryType} query: ${error.message}`);
        
        // Different fallback responses based on query type
        if (queryType === 'code') {
          responseBody = { 
            response: "I'm sorry, I couldn't process your code request at the moment. Please try again later or rephrase your question. Error: " + error.message.substring(0, 100), 
            type: 'code_error', 
            model: 'fallback' 
          };
        } else {
          // Fallback jokes for general chat
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
