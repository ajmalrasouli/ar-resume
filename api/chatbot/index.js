const OpenAI = require('openai');
const rateLimit = require('../../lib/rate-limit');

// Sample resume data - you should replace this with your actual resume data
const resumeData = {
  name: "Ajmal Rasouli",
  title: "Cloud & DevOps Engineer",
  skills: ["Azure", "Docker", "Kubernetes", "Terraform", "CI/CD", "Python", "JavaScript"],
  experience: [
    {
      role: "DevOps Engineer",
      company: "Your Company",
      period: "2020 - Present",
      description: "Building and maintaining cloud infrastructure and CI/CD pipelines."
    },
    // Add more experiences as needed
  ],
  education: [
    {
      degree: "Your Degree",
      institution: "Your University",
      year: "Year"
    }
  ],
  projects: [
    {
      name: "AI-Powered Resume",
      description: "Interactive resume with AI features"
    }
    // Add more projects as needed
  ]
};

module.exports = async function (context, req) {
  // Set CORS headers
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400"
  };

  // Handle preflight OPTIONS request
  if (req.method === "OPTIONS") {
    context.res = {
      status: 204,
      headers: corsHeaders,
      body: null
    };
    return;
  }

  try {
    // Rate limiting
    await rateLimit(context); 

    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OpenAI API key is not configured");
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const messages = req.body?.messages || [];
    
    // System prompt with resume data
    const systemPrompt = {
      role: "system",
      content: `You are Ajmal's AI assistant. Your purpose is to help people learn about Ajmal's professional background, skills, and experience.
      
      Here's Ajmal's resume information:
      ${JSON.stringify(resumeData, null, 2)}
      
      Guidelines for your responses:
      - Keep responses concise (1-3 sentences)
      - Be friendly and professional
      - If asked about topics not related to Ajmal's professional background, politely redirect the conversation back to his skills and experience
      - Never provide personal contact information
      - If you don't know the answer to something, say you're not sure but would be happy to discuss Ajmal's professional experience
      `
    };

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [systemPrompt, ...messages],
      temperature: 0.7,
      max_tokens: 150
    });

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
    console.error('Chatbot error:', error);
    
    context.res = {
      status: error.status || 500,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      },
      body: { 
        error: "I'm having trouble connecting to the AI assistant. Please try again later.",
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      }
    };
  }
};