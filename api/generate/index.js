require('dotenv').config();
const fetch = require('node-fetch');

module.exports = async function (context, req) {
  // Set CORS headers for ALL responses
  const corsHeaders = {
    "Access-Control-Allow-Origin": "https://lemon-desert-05dc5301e.6.azurestaticapps.net", // Or "*" for local testing, then restrict
    "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Max-Age": "86400",
    // "Content-Type": "application/json" // Let individual responses set this if needed
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
    if (!req.body || typeof req.body.inputs !== 'string' || req.body.inputs.trim() === "") { // Validate inputs more strictly
      context.res = {
        status: 400,
        headers: corsHeaders,
        body: JSON.stringify({ error: "Missing or invalid 'inputs' (must be a non-empty string) in request body" })
      };
      return;
    }

    const { inputs } = req.body;
    const normalizedQuery = inputs.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim(); // Normalize for matching

    if (!process.env.HF_API_KEY) {
      context.log.error("HF_API_KEY is not set in environment variables");
      context.res = {
        status: 500,
        headers: corsHeaders,
        body: JSON.stringify({ error: "API configuration error on the server." })
      };
      return;
    }
    
    // --- Logic to determine if it's Q&A or General Chat ---
    const specificQAContexts = {
      "what color is the sky": "The sky is typically blue during the day due to Rayleigh scattering of sunlight.",
      "what colour is the sky": "The sky is typically blue during the day due to Rayleigh scattering of sunlight.",
      "what is the capital of france": "The capital of France is Paris.",
      "who is the president of the united states": "As of my last update, the President of the United States is Joe Biden.",
      "what is the meaning of life": "The meaning of life is a philosophical question with many possible answers, often considered to be about finding purpose and happiness."
      // Add more question:context pairs here if you want them handled by the Q&A model
    };

    let isGeneralChat = true; // Default to general chat
    let qaContextToUse = null;

    // If the normalized query EXACTLY matches a key in our specificQAContexts, then it's Q&A
    if (specificQAContexts.hasOwnProperty(normalizedQuery)) {
      isGeneralChat = false;
      qaContextToUse = specificQAContexts[normalizedQuery];
      context.log.info(`Input "${inputs}" matched a specific Q&A context. Routing to Q&A.`);
    } else {
      context.log.info(`Input "${inputs}" did not match specific Q&A contexts. Routing to General Chat.`);
    }
    
    let hfResponse; // Renamed from 'response' to avoid conflict with 'context.res'
    let modelUsed = '';

    if (isGeneralChat) {
      context.log.info(`Attempting General Chat for input: "${inputs}"`);
      const chatModels = [
        { id: 'gpt2', name: 'GPT-2', endpoint: 'https://api-inference.huggingface.co/models/gpt2' },
        { id: 'distilgpt2', name: 'DistilGPT-2', endpoint: 'https://api-inference.huggingface.co/models/distilgpt2' },
        { id: 'bigscience/bloom-560m', name: 'BLOOM 560M', endpoint: 'https://api-inference.huggingface.co/models/bigscience/bloom-560m' }
      ];
      
      let lastError;
      
      // Optional: API Key validation (can be removed if causing too much overhead or if confident in key)
      try {
        const whoami = await fetch('https://huggingface.co/api/whoami-v2', {
          headers: { 'Authorization': `Bearer ${process.env.HF_API_KEY}` }
        });
        if (whoami.ok) {
          const userInfo = await whoami.json();
          context.log.info(`Hugging Face API key validated for user: ${userInfo.name || 'N/A'}`);
        } else {
          context.log.warn(`Hugging Face API key validation failed: ${whoami.status} - ${await whoami.text()}`);
          // Potentially stop here if key validation is critical and fails
        }
      } catch (e) {
        context.log.warn(`Error during API key validation: ${e.message}`);
      }

      for (const model of chatModels) {
        modelUsed = model.id;
        context.log.info(`Trying General Chat model: ${model.name} (${model.id})`);
        try {
          const modelFetch = await fetch(
            model.endpoint,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${process.env.HF_API_KEY}`,
                "X-Wait-For-Model": "true" // Wait if model is loading (can add to timeout)
              },
              body: JSON.stringify({
                inputs: inputs, // Use original 'inputs' here for casing, etc.
                parameters: {
                  max_new_tokens: 70, // Max NEW tokens, not total length
                  temperature: 0.7,
                  return_full_text: false, // Only get the generated part
                  num_return_sequences: 1,
                  do_sample: true, // For more creative responses
                  top_k: 50, // Consider top_k and top_p for better sampling
                  top_p: 0.95
                }
              }),
              // timeout: 20000 // Consider adding a timeout for each model fetch if using node-fetch v3+ with AbortController
            }
          );
          
          if (modelFetch.ok) {
            const responseData = await modelFetch.json();
            if (responseData && Array.isArray(responseData) && responseData.length > 0 && responseData[0].generated_text) {
              context.log.info(`Model ${model.name} responded successfully.`);
              hfResponse = { // Store the successful fetch response object structure
                  ok: true,
                  status: modelFetch.status,
                  json: async () => responseData // Mimic fetch response
              };
              break; // Success, exit loop
            } else {
              lastError = new Error(`Model ${model.name} gave empty or invalid response: ${JSON.stringify(responseData)}`);
              context.log.warn(lastError.message);
            }
          } else {
            const errorText = await modelFetch.text();
            lastError = new Error(`Model ${model.name} (${model.id}) returned ${modelFetch.status}: ${errorText}`);
            context.log.warn(lastError.message);
          }
        } catch (error) {
          lastError = error;
          context.log.warn(`Exception with model ${model.name}: ${error.message}`);
        }
      }
      
      if (!hfResponse) { // If all models failed or no valid response
        context.log.warn('All chat models failed or returned invalid data. Using fallback response.');
        const fallbackJokes = [
          "Why don't scientists trust atoms? Because they make up everything!",
          "Did you hear about the mathematician who's afraid of negative numbers? He'll stop at nothing to avoid them!",
          "Why don't eggs tell jokes? They'd crack each other up!",
          "I told my wife she was drawing her eyebrows too high. She looked surprised.",
          "What's the best thing about Switzerland? I don't know, but the flag is a big plus!"
        ];
        const randomJoke = fallbackJokes[Math.floor(Math.random() * fallbackJokes.length)];
        const errorMessage = lastError ? ` (Last attempt error: ${lastError.message.split(':')[0].substring(0, 100)})` : '';
        
        hfResponse = { // Mimic successful structure for downstream processing
          ok: true, // Fallback is "ok" from function's perspective
          status: 200,
          json: async () => [{
            generated_text: `${randomJoke} (This is a fallback response as AI models are currently unavailable.${errorMessage})`
          }]
        };
      }

    } else { // Q&A Logic
      context.log.info(`Attempting Q&A for input: "${inputs}" with context for "${normalizedQuery}"`);
      modelUsed = 'deepset/roberta-base-squad2';
      const defaultContextForUnhandledQA = "I am an AI assistant. I can try to answer questions if context is provided.";
      
      const payload = {
        inputs: {
          question: inputs, // Use original 'inputs'
          context: qaContextToUse || defaultContextForUnhandledQA
        }
      };
      
      hfResponse = await fetch( // Store the actual fetch response
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

    // --- Process the hfResponse (whether from chat, Q&A, or fallback) ---
    if (!hfResponse || !hfResponse.ok) { // Check if hfResponse itself is an error (e.g., Q&A fetch failed)
      const errorText = hfResponse ? await hfResponse.text() : "Unknown error before Hugging Face call";
      const errorStatus = hfResponse ? hfResponse.status : 500;
      context.log.error(`Hugging Face API interaction error: ${errorStatus} - ${errorText}`);
      
      context.res = {
        status: errorStatus,
        headers: corsHeaders,
        body: JSON.stringify({ 
          error: `Hugging Face API returned ${errorStatus}`,
          details: errorText
        })
      };
      return;
    }

    // Parse successful hfResponse
    let responseBody;
    try {
      const data = await hfResponse.json(); // This will be an array for chat/fallback, object for Q&A
      
      if (isGeneralChat) {
        let generatedText = (Array.isArray(data) && data[0]?.generated_text) ? data[0].generated_text : "I'm not sure how to respond to that right now.";
        generatedText = generatedText.replace(/^\s*\n+/, '').replace(/\n+/g, ' ').trim(); // Clean up
          
        responseBody = {
          response: generatedText,
          type: 'chat',
          model: modelUsed
        };
      } else { // Q&A
        const MIN_CONFIDENCE = 0.60; // Adjusted minimum confidence
      
        if (!data || typeof data.score === 'undefined' || data.score < MIN_CONFIDENCE) {
          const lowConfidenceNote = data && typeof data.score !== 'undefined' ? `Original Q&A score ${data.score.toFixed(2)} was below threshold ${MIN_CONFIDENCE}.` : 'Q&A model did not provide a confident answer.';
          context.log.info(`Q&A confidence low or no answer. ${lowConfidenceNote} Falling back to a chat model for: "${inputs}"`);
          modelUsed = 'gpt2'; // Fallback chat model
          
          const chatFallbackFetch = await fetch(
            "https://api-inference.huggingface.co/models/gpt2", // Or another preferred chat model
            {
              method: "POST",
              headers: { "Content-Type": "application/json", "Authorization": `Bearer ${process.env.HF_API_KEY}` },
              body: JSON.stringify({ inputs: inputs, parameters: { max_new_tokens: 70, return_full_text: false } })
            }
          );
          
          if (chatFallbackFetch.ok) {
            const chatData = await chatFallbackFetch.json();
            let fallbackText = (Array.isArray(chatData) && chatData[0]?.generated_text) ? chatData[0].generated_text : "I'm not quite sure how to answer that.";
            fallbackText = fallbackText.replace(/^\s*\n+/, '').replace(/\n+/g, ' ').trim();

            responseBody = {
              response: fallbackText,
              type: 'chat', // Switched to chat type
              model: modelUsed,
              note: `Fallback from Q&A. ${lowConfidenceNote}`
            };
          } else {
            context.log.warn(`Q&A fallback to chat model failed: ${chatFallbackFetch.status}`);
            responseBody = {
              response: data.answer || "I'm unable to provide a confident answer or fall back at the moment.",
              type: 'qa_error', // Indicate Q&A failure
              model: 'deepset/roberta-base-squad2', // Original Q&A model
              note: `Low confidence and chat fallback failed. Original score: ${data.score || 'N/A'}.`
            };
          }
        } else { // Q&A confidence is good
          responseBody = {
            answer: data.answer || "I'm not sure how to answer that.",
            score: data.score,
            type: 'qa',
            model: modelUsed
          };
        }
      }
    } catch (error) {
      context.log.error('Error parsing final Hugging Face response or during Q&A fallback logic:', error);
      responseBody = {
        response: "I'm sorry, I encountered an error processing the AI's response.",
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
    context.log.error(`Unhandled top-level error: ${error.message}`, error.stack);
    context.res = {
      status: 500,
      headers: corsHeaders,
      body: JSON.stringify({
        error: "An unexpected server error occurred.",
        details: error.message // Provide message for debugging
        // stack: process.env.NODE_ENV === 'development' ? error.stack : undefined // Avoid sending stack in prod
      })
    };
  }
};