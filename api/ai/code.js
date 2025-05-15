export default async function handler(req, res) {
    // Set CORS headers
    // Allow requests from any origin in development, replace with your domain in production
    const allowedOrigins = [
        'http://localhost:3000',
        'http://localhost:5173',
        'https://lemon-desert-05dc5301e.6.azurestaticapps.net',
        'https://your-production-domain.azurestaticapps.net'
    ];
    const origin = req.headers.origin;
    if (allowedOrigins.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    }
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { prompt } = req.body;

    if (!prompt) {
        return res.status(400).json({ error: 'Prompt is required' });
    }

    try {
        const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.VITE_DEEPSEEK_API_KEY || process.env.DEEPSEEK_API_KEY}`
            },
            body: JSON.stringify({
                model: 'deepseek-coder',
                messages: [{
                    role: 'user',
                    content: `You are a helpful coding assistant. Please provide a clear explanation and example for: ${prompt}`
                }],
                max_tokens: 500,
                temperature: 0.7
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error?.message || 'Failed to fetch from DeepSeek API. Please check your API key and try again.');
        }

        const data = await response.json();
        res.status(200).json(data);
    } catch (error) {
        console.error('API Error:', error);
        res.status(500).json({
            error: error.message || 'An error occurred while processing your request'
        });
    }
}
