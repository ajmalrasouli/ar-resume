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

    try {
        const { messages, model = 'gpt-3.5-turbo', max_tokens = 500 } = req.body;
        
        if (!messages) {
            return res.status(400).json({ error: 'Messages are required' });
        }

        const apiKey = process.env.VITE_OPENAI_API_KEY || process.env.OPENAI_API_KEY;
        if (!apiKey) {
            console.error('OpenAI API key is missing');
            return res.status(500).json({ error: 'Server configuration error: Missing API key' });
        }

        console.log('Sending request to OpenAI API...');
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model,
                messages: Array.isArray(messages) ? messages : [{ role: 'user', content: String(messages) }],
                max_tokens: parseInt(max_tokens, 10) || 500,
                temperature: 0.7
            })
        });

        const responseText = await response.text();
        let data;
        
        try {
            data = responseText ? JSON.parse(responseText) : null;
        } catch (e) {
            console.error('Failed to parse API response:', responseText);
            throw new Error('Invalid response from AI service');
        }

        if (!response.ok) {
            console.error('OpenAI API error:', data);
            throw new Error(data?.error?.message || `API request failed with status ${response.status}`);
        }

        if (!data || !data.choices || !Array.isArray(data.choices) || data.choices.length === 0) {
            throw new Error('Invalid response format from AI service');
        }

        res.status(200).json(data);
    } catch (error) {
        console.error('API Handler Error:', error);
        res.status(500).json({
            error: error.message || 'An error occurred while processing your request'
        });
    }
}
