const OpenAI = require('openai');
const resumeData = require('./resume-data');

function logEnvironment(context) {
    const envVars = {};
    for (const key in process.env) {
        if (key.includes('KEY') || key.includes('SECRET') || key.includes('PASSWORD')) {
            envVars[key] = '***REDACTED***';
        } else {
            envVars[key] = process.env[key];
        }
    }
    context.log('Environment variables:', JSON.stringify(envVars, null, 2));
}

async function chatbot(context, req) {
    context.log('Chatbot function processed a request.');
    context.log('Request method:', req.method);
    logEnvironment(context);

    const corsHeaders = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type"
    };

    if (req.method === "OPTIONS") {
        context.res = { status: 204, headers: corsHeaders, body: null };
        return;
    }

    try {
        if (!process.env.OPENAI_API_KEY) {
            throw new Error('OpenAI API key not configured');
        }

        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
        const messages = req.body?.messages || [];

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

TECHNICAL SKILLS:
${resumeData.skills.technical.join('\n')}

KEY PROJECTS:
${resumeData.skills.projects.map(proj => `
- ${proj.name}:
  ${proj.details.join('\n  ')}`).join('\n')}

CERTIFICATIONS:
${resumeData.certificates.join('\n')}

RESPONSE RULES:
1. Answer only career-related questions
2. Keep responses under 3 sentences
3. For unrelated queries: "I specialize in discussing ${resumeData.about.name}'s professional background"
4. Mention relevant certifications/projects when applicable`;

        const systemPrompt = {
            role: "system",
            content: systemPromptContent
        };

        const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [systemPrompt, ...messages],
        });

        context.res = {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            body: { text: response.choices[0].message.content }
        };

    } catch (error) {
        context.log.error('Error:', error);
        const isDevelopment = process.env.NODE_ENV === 'development';
        context.res = {
            status: error.status || 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            body: {
                error: "Chatbot Error",
                message: isDevelopment ? error.message : 'Please try again later',
                ...(isDevelopment && { stack: error.stack })
            }
        };
    }
}

module.exports = { default: chatbot };