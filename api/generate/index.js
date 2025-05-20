require('dotenv').config(); // For local development with a .env file
const fetch = require('node-fetch'); // Or use global fetch if Node.js runtime is v18+

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
    // --- API Key Validation (whoami-v2 check) ---
    const apiKey = process.env.HF_API_KEY;
    context.log.info(`[AZURE FUNCTION KEY CHECK] HF_API_KEY from Azure env: ${apiKey ? apiKey.substring(0,6) + "..." + apiKey.substring(apiKey.length - 4) : "NOT SET OR EMPTY"}`);
    if (!apiKey) {
      context.log.error("HF_API_KEY is not set in environment variables.");
      context.res = {
        status: 500,
        headers: corsHeaders,
        body: JSON.stringify({ error: "API configuration error on the server." })
      };
      return;
    }

    context.log.info(`[VALIDATION] Attempting whoami-v2 check with key: ${apiKey.substring(0,9)}...`);
    try {
        const whoamiCheckResponse = await fetch('https://huggingface.co/api/whoami-v2', {
            headers: { 'Authorization': `Bearer ${apiKey}` },
            timeout: 5000 // 5 second timeout for this check
        });
        const whoamiText = await whoamiCheckResponse.text(); // Read text first for detailed error
        context.log.info(`[VALIDATION] whoami-v2 status: ${whoamiCheckResponse.status}, text: ${whoamiText}`);
        if (!whoamiCheckResponse.ok) {
            context.log.error(`[VALIDATION] API Key FAILED whoami-v2 check. Status: ${whoamiCheckResponse.status}. Response: ${whoamiText}`);
            // Optional: You could return an error to the client here if the key is definitively invalid.
            // context.res = { status: 401, headers: corsHeaders, body: JSON.stringify({ error: "Hugging Face API Key validation failed.", details: whoamiText })};
            // return;
        } else {
             // Try to parse JSON only if OK, as error responses might not be JSON
            try {
                const userInfo = JSON.parse(whoamiText); // whoamiText should be JSON on success
                context.log.info(`[VALIDATION] Successfully authenticated with Hugging Face as: ${userInfo.name || userInfo.fullname || 'User'}`);
            } catch (jsonParseError) {
                context.log.warn(`[VALIDATION] whoami-v2 response was OK but not valid JSON: ${whoamiText}`);
            }
        }
    } catch (whoamiError) {
        context.log.error(`[VALIDATION] Exception during whoami-v2 check: ${whoamiError.message}`);
        // Decide if you want to stop or continue if whoami-v2 fails due to network etc.
    }
    // --- End API Key Validation ---


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

    const specificQAContexts = {
      "what color is the sky": "The sky is typically blue during the day due to Rayleigh scattering of sunlight.",
      "what colour is the sky": "The sky is typically blue during the day due to Rayleigh scattering of sunlight.",
      "what is the capital of france": "The capital of France is Paris.",
      "who is the president of the united states": "As of my last update, the President of the United States is Joe Biden.",
      "what is the meaning of life": "The meaning of life is a philosophical question with many possible answers, often considered to be about finding purpose and happiness."
    };

    let isGeneralChat = true;
    let qaContextToUse = null;

    if (specificQAContexts.hasOwnProperty(normalizedQuery)) {
      isGeneralChat = false;
      qaContextToUse = specificQAContexts[normalizedQuery];
      context.log.info(`Input "${inputs}" matched a specific Q&A context. Routing to Q&A.`);
    } else {
      context.log.info(`Input "${inputs}" did not match specific Q&A contexts. Routing to General Chat.`);
    }
    
    let hfResponse;
    let modelUsed = '';

    // Function to implement fetch with timeout using AbortController
    async function fetchWithTimeout(resource, options = {}, timeout = 10000) {
        const controller = new AbortController();
        const id = setTimeout(() => {
            context.log.warn(`Request to ${resource} aborted after ${timeout}ms`);
            controller.abort();
        }, timeout);

        try {
            const response = await fetch(resource, {
                ...options,
                signal: controller.signal
            });
            clearTimeout(id);
            return response;
        } catch (error) {
            clearTimeout(id);
            if (error.name === 'AbortError') {
                throw new Error(`Request to ${resource} timed out after ${timeout}ms`);
            }
            throw error;
        }
    }


    if (isGeneralChat) {
      context.log.info(`Attempting General Chat for input: "${inputs}"`);
      
      const chatModels = [
        // Only include models that are confirmed to work
        { id: 'gpt2', name: 'GPT-2', endpoint: 'https://api-inference.huggingface.co/models/gpt2' },
        { id: 'EleutherAI/gpt-neo-125m', name: 'GPT-Neo 125M', endpoint: 'https://api-inference.huggingface.co/models/EleutherAI/gpt-neo-125m' },
        { id: 'facebook/opt-125m', name: 'OPT 125M', endpoint: 'https://api-inference.huggingface.co/models/facebook/opt-125m' },
        { id: 'sshleifer/tiny-gpt2', name: 'Tiny GPT-2', endpoint: 'https://api-inference.huggingface.co/models/sshleifer/tiny-gpt2' }
      ];
      
      let lastError;
      const shuffledModels = [...chatModels].sort(() => Math.random() - 0.5); // Shuffle to vary attempts
      
      for (const model of shuffledModels) {
        modelUsed = model.id;
        context.log.info(`Trying General Chat model: ${model.name} (${model.id})`);
        try {
          const modelFetch = await fetchWithTimeout( // Using fetchWithTimeout
            model.endpoint,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`,
                "X-Wait-For-Model": "true",
                "X-Use-Cache": "true"
              },
              body: JSON.stringify({
                inputs: inputs,
                parameters: {
                  max_new_tokens: 70,
                  temperature: 0.75, // Slightly increased temperature
                  return_full_text: false,
                  num_return_sequences: 1,
                  do_sample: true,
                  top_k: 50,
                  top_p: 0.95
                }
              })
            }, 15000 // 15-second timeout for each model call
          );
          
          if (modelFetch.ok) {
            const responseData = await modelFetch.json();
            if (responseData && Array.isArray(responseData) && responseData.length > 0 && responseData[0].generated_text) {
              context.log.info(`Model ${model.name} responded successfully.`);
              hfResponse = {
                  ok: true,
                  status: modelFetch.status,
                  json: async () => responseData
              };
              break; 
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
          lastError = error; // This will catch AbortError from timeout as well
          context.log.warn(`Exception with model ${model.name}: ${error.message}`);
        }
      }
      
      if (!hfResponse) {
        context.log.warn('All chat models failed or returned invalid data. Using fallback response.');
        const fallbackJokes = [ /* ... your jokes ... */ ];
        const randomJoke = fallbackJokes[Math.floor(Math.random() * fallbackJokes.length)];
        const errorMessage = lastError ? ` (Last error: ${lastError.message.split(':')[0].substring(0, 100)})` : '';
        
        hfResponse = {
          ok: true, status: 200,
          json: async () => [{ generated_text: `${randomJoke} (This is a fallback response as AI models are currently unavailable.${errorMessage})` }]
        };
      }

    } else { // Q&A Logic
      context.log.info(`Attempting Q&A for input: "${inputs}" with context for "${normalizedQuery}"`);
      modelUsed = 'deepset/roberta-base-squad2';
      const defaultContextForUnhandledQA = "I am an AI assistant. I can try to answer questions if context is provided.";
      
      const payload = { inputs: { question: inputs, context: qaContextToUse || defaultContextForUnhandledQA } };
      
      try {
        hfResponse = await fetchWithTimeout( // Using fetchWithTimeout
          `https://api-inference.huggingface.co/models/${modelUsed}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
            body: JSON.stringify(payload)
          }, 15000 // 15-second timeout
        );
      } catch (error) {
        context.log.error(`Exception fetching from Q&A model ${modelUsed}: ${error.message}`);
        // hfResponse will be undefined, handled by the check below
      }
    }

    // --- Process the hfResponse (whether from chat, Q&A, or fallback) ---
    if (!hfResponse || !hfResponse.ok) {
      const errorText = hfResponse ? await hfResponse.text() : (hfResponse === undefined ? "Fetch call failed before response (e.g. timeout or network error)" : "Unknown error with hfResponse object");
      const errorStatus = hfResponse ? hfResponse.status : 500;
      context.log.error(`Hugging Face API interaction error or no valid hfResponse. Status: ${errorStatus} - Details: ${errorText}`);
      
      if (!isGeneralChat && hfResponse && !hfResponse.ok) { // Only if Q&A path was taken AND it failed
        context.log.info("Q&A model failed. Falling back to general chat model as a last resort.");
        try {
          const fallbackChatModel = 'gpt2'; // A reliable, small chat model for this specific fallback
          modelUsed = fallbackChatModel; // Update modelUsed for the response
          const fallbackFetch = await fetchWithTimeout(
            `https://api-inference.huggingface.co/models/${fallbackChatModel}`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
              body: JSON.stringify({ inputs: inputs, parameters: { max_new_tokens: 70, return_full_text: false } })
            }, 15000
          );
          
          if (fallbackFetch.ok) {
            const fallbackData = await fallbackFetch.json();
            if (fallbackData && Array.isArray(fallbackData) && fallbackData[0]?.generated_text) {
              let fallbackGeneratedText = fallbackData[0].generated_text.replace(/^\s*\n+/, '').replace(/\n+/g, ' ').trim();
              context.res = {
                status: 200, headers: corsHeaders,
                body: JSON.stringify({ response: fallbackGeneratedText, type: 'chat', model: modelUsed, note: 'Fallback from failed Q&A' })
              };
              return;
            }
          }
          context.log.warn(`Q&A -> Chat fallback also failed. Status: ${fallbackFetch ? fallbackFetch.status : 'Unknown'}`);
        } catch (fallbackErr) {
          context.log.error(`Exception during Q&A -> Chat fallback: ${fallbackErr.message}`);
        }
      }
      // If still no success, send the original error or a generic one
      context.res = {
        status: errorStatus, headers: corsHeaders,
        body: JSON.stringify({ error: `Hugging Face API interaction failed. Status: ${errorStatus}`, details: errorText })
      };
      return;
    }

    // Parse successful hfResponse
    let responseBody;
    try {
      const data = await hfResponse.json();
      
      if (isGeneralChat) {
        let generatedText = (Array.isArray(data) && data[0]?.generated_text) ? data[0].generated_text : "I'm not sure how to respond to that right now.";
        generatedText = generatedText.replace(/^\s*\n+/, '').replace(/\n+/g, ' ').trim();
        responseBody = { response: generatedText, type: 'chat', model: modelUsed };
      } else { // Q&A
        const MIN_CONFIDENCE = 0.60;
        if (!data || typeof data.score === 'undefined' || data.score < MIN_CONFIDENCE) {
          const lowConfidenceNote = data && typeof data.score !== 'undefined' ? `Original Q&A score ${data.score.toFixed(2)} was below threshold ${MIN_CONFIDENCE}.` : 'Q&A model did not provide a confident answer.';
          context.log.info(`Q&A confidence low or no answer. ${lowConfidenceNote} Falling back to a chat model for: "${inputs}"`);
          
          const fallbackChatModelForQA = 'gpt2'; // Specific model for this fallback
          modelUsed = fallbackChatModelForQA;
          const chatFallbackFetch = await fetchWithTimeout(
            `https://api-inference.huggingface.co/models/${fallbackChatModelForQA}`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
              body: JSON.stringify({ inputs: inputs, parameters: { max_new_tokens: 70, return_full_text: false } })
            }, 15000
          );
          
          if (chatFallbackFetch.ok) {
            const chatData = await chatFallbackFetch.json();
            let fallbackText = (Array.isArray(chatData) && chatData[0]?.generated_text) ? chatData[0].generated_text : "I'm not quite sure how to answer that.";
            fallbackText = fallbackText.replace(/^\s*\n+/, '').replace(/\n+/g, ' ').trim();
            responseBody = { response: fallbackText, type: 'chat', model: modelUsed, note: `Fallback from Q&A. ${lowConfidenceNote}` };
          } else {
            const fallbackErrorText = await chatFallbackFetch.text();
            context.log.warn(`Q&A fallback to chat model failed: ${chatFallbackFetch.status} - ${fallbackErrorText}`);
            responseBody = {
              response: data.answer || "I'm unable to provide a confident answer or fall back at the moment.",
              type: 'qa_error', model: 'deepset/roberta-base-squad2',
              note: `Low confidence and chat fallback failed. Original score: ${data.score || 'N/A'}. Fallback status: ${chatFallbackFetch.status}`
            };
          }
        } else { // Q&A confidence is good
          responseBody = { answer: data.answer || "I'm not sure how to answer that.", score: data.score, type: 'qa', model: modelUsed };
        }
      }
    } catch (error) {
      context.log.error('Error parsing final Hugging Face response or during Q&A fallback logic:', error);
      responseBody = { response: "I'm sorry, I encountered an error processing the AI's response.", type: 'error', error: error.message };
    }
    
    context.res = { status: 200, headers: corsHeaders, body: JSON.stringify(responseBody) };

  } catch (error) {
    context.log.error(`Unhandled top-level error: ${error.message}`, error.stack);
    context.res = {
      status: 500, headers: corsHeaders,
      body: JSON.stringify({ error: "An unexpected server error occurred.", details: error.message })
    };
  }
};