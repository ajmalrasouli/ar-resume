const axios = require('axios');

module.exports = async function (context, req) {
    context.log('Image generation function processed a request.');

    // Handle CORS preflight
    if (req.method === "OPTIONS") {
        context.res = {
            status: 200,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "POST, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type"
            },
            body: ""
        };
        return;
    }

    try {
        const { prompt } = req.body;
        
        if (!prompt) {
            context.res = {
                status: 400,
                headers: { "Content-Type": "application/json" },
                body: { error: "Please provide a prompt for image generation" }
            };
            return;
        }

        const apiKey = process.env.STABILITY_API_KEY;
        if (!apiKey) {
            throw new Error("Stability AI API key is not configured");
        }

        // Create a custom axios instance with timeout and better error handling
        const axiosInstance = axios.create({
            timeout: 60000, // 60 seconds timeout
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            }
        });

        const response = await axiosInstance.post(
            'https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image',
            {
                text_prompts: [{ 
                    text: prompt,
                    weight: 1
                }],
                cfg_scale: 7,
                height: 1024, // Using supported dimension
                width: 1024,  // Using supported dimension
                steps: 30,    // Standard number of steps
                samples: 1,
            }
        );

        // Return the image data
        context.res = {
            status: 200,
            headers: { 
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*"
            },
            body: {
                success: true,
                image: response.data.artifacts[0].base64
            }
        };

    } catch (error) {
        context.log.error('Error details:', {
            message: error.message,
            code: error.code,
            status: error.response?.status,
            statusText: error.response?.statusText,
            data: error.response?.data
        });
        
        let errorMessage = "Failed to generate image";
        if (error.code === 'ECONNABORTED') {
            errorMessage = "Request timed out. Please try again.";
        } else if (error.code === 'ECONNRESET') {
            errorMessage = "Connection to the AI service was reset. Please check your API key and network connection.";
        } else if (error.response) {
            errorMessage = error.response.data?.message || errorMessage;
            if (error.response.status === 401) {
                errorMessage = "Invalid API key. Please check your Stability AI API key.";
            } else if (error.response.status === 429) {
                errorMessage = "Rate limit exceeded. Please wait before making another request.";
            }
        } else if (error.message) {
            errorMessage = error.message;
        }

        context.res = {
            status: error.response?.status || 500,
            headers: { 
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*"
            },
            body: {
                success: false,
                error: errorMessage
            }
        };
    }
};