const fetch = require('node-fetch');

module.exports = async function (context, req) {

    if (req.method === "OPTIONS") {
        context.res = {
            status: 200,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "POST, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type, Authorization"
            },
            body: ""
        };
        return;
    }
    if (req.method !== "POST") {
        context.res = { status: 405, body: "Method Not Allowed" };
        return;
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
        context.res = { status: 500, body: "OpenAI API key not set" };
        return;
    }

    const messages = req.body?.messages || [];
    const model = req.body?.model || "gpt-3.5-turbo";
    const max_tokens = req.body?.max_tokens || 500;
    const temperature = req.body?.temperature || 0.7;

    try {
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model,
                messages,
                max_tokens,
                temperature
            })
        });

        let data, text;
        try {
            text = await response.text();
            data = text ? JSON.parse(text) : null;
        } catch (e) {
            data = { error: 'Failed to parse response', raw: text };
        }

        if (!response.ok) {
            context.res = {
                status: response.status,
                body: {
                    error: data?.error || data || 'Unknown error',
                    status: response.status,
                    statusText: response.statusText,
                    raw: text
                }
            };
            return;
        }

        context.res = {
            status: response.status,
            body: data
        };
    } catch (error) {
        context.res = {
            status: 500,
            body: {
                error: error.message,
                stack: error.stack
            }
        };
    }
};
