const axios = require('axios');
const https = require('https');

async function testStabilityAPI() {
    const apiKey = process.env.STABILITY_API_KEY || 'your-api-key-here';
    
    console.log('Starting API test...');
    console.log(`Using API key: ${apiKey.substring(0, 5)}...${apiKey.substring(apiKey.length - 4)}`);
    
    // Test basic internet connectivity
    try {
        console.log('\nTesting internet connectivity...');
        const pingResponse = await axios.get('https://www.google.com', { timeout: 5000 });
        console.log('✅ Internet connectivity: OK');
    } catch (err) {
        console.error('❌ No internet connectivity:', err.message);
        return;
    }

    console.log('Testing Stability AI API with your key...');
    
    // Test DNS resolution
    try {
        console.log('\nTesting DNS resolution...');
        const dns = require('dns');
        await new Promise((resolve, reject) => {
            dns.lookup('api.stability.ai', (err) => {
                if (err) reject(err);
                else resolve();
            });
        });
        console.log('✅ DNS resolution: OK');
    } catch (err) {
        console.error('❌ DNS resolution failed:', err.message);
        return;
    }

    // Test API endpoint
    console.log('\nTesting Stability AI API endpoint...');
    try {
        const response = await axios.get('https://api.stability.ai/v1/engines/list', {
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Accept': 'application/json'
            },
            httpsAgent: new https.Agent({  
                rejectUnauthorized: false,  // Bypass SSL verification (for testing only)
                timeout: 10000
            }),
            timeout: 15000 // 15 seconds timeout
        });
        
        console.log('✅ API Connection: Success!');
        console.log('Status:', response.status);
        console.log('Available engines:', response.data);
    } catch (error) {
        console.error('❌ API Test Failed:');
        if (error.code) console.error('Error code:', error.code);
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Response:', error.response.data);
        } else if (error.request) {
            console.error('No response received. Details:');
            console.error('- Request made but no response');
            console.error('- Error message:', error.message);
            if (error.code === 'ECONNABORTED') {
                console.error('- The request timed out');
            } else if (error.code === 'ENOTFOUND') {
                console.error('- Could not resolve host');
            } else if (error.code === 'ECONNREFUSED') {
                console.error('- Connection refused by server');
            }
        } else {
            console.error('Error:', error.message);
        }
    }
}

testStabilityAPI();
