// Import the OpenAI package
const OpenAI = require('openai');

// Log environment variables (except sensitive ones) for debugging
function logEnvironment(context) {
    const envVars = {};
    for (const key in process.env) {
        // Don't log sensitive information
        if (key.includes('KEY') || key.includes('SECRET') || key.includes('PASSWORD')) {
            envVars[key] = '***REDACTED***';
        } else {
            envVars[key] = process.env[key];
        }
    }
    context.log('Environment variables:', JSON.stringify(envVars, null, 2));
}

// Main function
async function chatbot(context, req) {
    // Log the incoming request
    context.log('Chatbot function processed a request.');
    context.log('Request method:', req.method);
    context.log('Request headers:', JSON.stringify(req.headers, null, 2));
    
    // Log environment variables for debugging
    logEnvironment(context);

    // Set CORS headers
    const corsHeaders = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type"
    };

    // Handle preflight OPTIONS request
    if (req.method === "OPTIONS") {
        context.log('Handling OPTIONS preflight request');
        context.res = {
            status: 204,
            headers: corsHeaders,
            body: null
        };
        return;
    }

    try {
        // Check for OpenAI API key
        if (!process.env.OPENAI_API_KEY) {
            const error = new Error('OpenAI API key is not configured');
            error.status = 500;
            error.code = 'MISSING_API_KEY';
            throw error;
        }

        // Log that we're initializing OpenAI
        context.log('Initializing OpenAI with API key:', 
            process.env.OPENAI_API_KEY ? '***KEY_PRESENT***' : 'MISSING');

        // Initialize OpenAI with the API key
        const openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY
        });
        
        // Simple test to verify OpenAI initialization
        const responseBody = {
            message: "Chatbot API is working with OpenAI!",
            openaiInitialized: !!openai,
            timestamp: new Date().toISOString(),
            method: req.method,
            nodeVersion: process.version,
            environment: process.env.NODE_ENV || 'development'
        };

        context.log('Successfully initialized OpenAI, sending response');
        
        context.res = {
            status: 200,
            headers: {
                ...corsHeaders,
                "Content-Type": "application/json"
            },
            body: responseBody
        };
        
    } catch (error) {
        // Log the full error
        context.log.error('Error in chatbot function:', {
            message: error.message,
            stack: error.stack,
            code: error.code,
            status: error.status || 500
        });

        // Return error response
        const isDevelopment = process.env.NODE_ENV === 'development';
        context.res = {
            status: error.status || 500,
            headers: {
                ...corsHeaders,
                "Content-Type": "application/json"
            },
            body: {
                error: "Internal Server Error",
                message: isDevelopment ? error.message : 'An error occurred',
                code: error.code,
                ...(isDevelopment ? { stack: error.stack } : {})
            }
        };
    }
}

// Export the function for Azure Functions
module.exports = {
    default: chatbot
};