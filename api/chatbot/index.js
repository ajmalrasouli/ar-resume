const OpenAI = require('openai');
const rateLimit = require('../../lib/rate-limit');

module.exports = async function (context, req) {
  try {
    // Rate limiting (use your existing implementation)
    await rateLimit(context); 

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const messages = req.body.messages;
    
    // System prompt with resume data
    const systemPrompt = {
      role: "system",
      content: `You are Ajmal's AI assistant. Use this resume data:
        ${JSON.stringify(yourResumeData)}
        - Keep responses under 3 sentences
        - If asked unrelated questions, say "I specialize in discussing Ajmal's background!"
      `
    };

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [systemPrompt, ...messages],
    });

    context.res = {
      status: 200,
      body: { 
        text: response.choices[0].message.content 
      }
    };

  } catch (error) {
    context.res = {
      status: 500,
      body: { 
        error: "Chatbot unavailable. Please try later.",
        details: error.message 
      }
    };
  }
};