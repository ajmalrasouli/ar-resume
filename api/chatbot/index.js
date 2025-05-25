const OpenAI = require('openai');
const rateLimit = require('../lib/rate-limit');
const resumeData = require('./resume-data');

async function chatbot(context, req) {
    const corsHeaders = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type"
    };

    try {
        // Apply rate limiting first
        await rateLimit(context);

        // Handle OPTIONS preflight
        if (req.method === "OPTIONS") {
            context.res = { 
                status: 204, 
                headers: corsHeaders,
                body: null 
            };
            return;
        }

        // Validate OpenAI API key
        if (!process.env.OPENAI_API_KEY) {
            throw new Error('OpenAI API key not configured');
        }

        // Initialize OpenAI client
        const openai = new OpenAI({ 
            apiKey: process.env.OPENAI_API_KEY 
        });

        // Get messages from request body
        const messages = req.body?.messages || [];
        if (!messages.length) {
            throw new Error('No messages provided');
        }

        // Create system prompt
        const systemPromptContent = `You are ${resumeData.about.name}'s professional chatbot. Use this resume data:

        ABOUT:
        ${resumeData.about.summary}

        EXPERIENCE:
        ${resumeData.experience.map(exp => `
        - ${exp.position} at ${exp.company} (${exp.duration}):
          ${exp.details}`).join('\n')}

        EDUCATION:
        ${resumeData.education.map(edu => `
        - ${edu.degree}
          ${edu.institution} (${edu.duration})`).join('\n')}

        SKILLS:
        ${resumeData.skills.technical.join('\n')}

        RESPONSE RULES:
        1. Answer only career-related questions
        2. Keep responses under 3 sentences
        3. Redirect non-career questions to: "I specialize in discussing ${resumeData.about.name}'s professional background"
        4. Mention relevant certifications when applicable`;

        // Create chat completion
        const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [{
                role: "system",
                content: systemPromptContent
            }, ...messages]
        });

        // Successful response
        context.res = {
            status: 200,
            headers: {
                ...corsHeaders,
                "Content-Type": "application/json"
            },
            body: { 
                text: response.choices[0].message.content 
            }
        };

    } catch (error) {
        context.log.error('Chatbot Error:', error);

        // Preserve rate limit headers if present
        const existingHeaders = context.res?.headers || {};

        context.res = {
            status: error.message.includes('Rate limit') ? 429 : 500,
            headers: {
                ...corsHeaders,
                ...existingHeaders,
                "Content-Type": "application/json"
            },
            body: {
                error: error.message.includes('Rate limit') 
                    ? 'Too many requests, please try again later.' 
                    : 'Chatbot unavailable',
                ...(process.env.NODE_ENV === 'development' && { 
                    details: error.message 
                })
            }
        };
    }
}

module.exports = { default: chatbot };