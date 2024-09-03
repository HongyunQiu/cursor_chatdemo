const http = require('http');
const fs = require('fs');
const path = require('path');
require('dotenv').config();
const { OpenAI } = require('openai');
const { HttpsProxyAgent } = require('https-proxy-agent');

const proxyUrl = 'http://127.0.0.1:7890'; // 替换为您的代理服务器地址
const agent = new HttpsProxyAgent(proxyUrl);

const openai = new OpenAI({ 
    apiKey: process.env.OPENAI_API_KEY,
    httpAgent: agent
});

const server = http.createServer((req, res) => {
    if (req.url === '/' || req.url === '/index.html') {
        serveFile('../public/index.html', 'text/html', res);
    } else if (req.url === '/aiChat.js') {
        serveFile('aiChat.js', 'text/javascript', res);
    } else if (req.url === '/styles.css') {
        serveFile('../public/styles.css', 'text/css', res);
    } else if (req.url === '/api/ai-chat' && req.method === 'POST') {
        handleAIChatRequest(req, res);
    } else {
        res.writeHead(404);
        res.end('Page not found');
    }
});

function serveFile(filePath, contentType, res) {
    fs.readFile(path.join(__dirname, filePath), (err, content) => {
        if (err) {
            res.writeHead(500);
            res.end(`Error loading ${filePath}`);
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content);
        }
    });
}

async function handleAIChatRequest(req, res) {
    let body = '';
    req.on('data', chunk => {
        body += chunk.toString();
    });
    req.on('end', async () => {
        try {
            console.log('Received request body:', body);
            const { message } = JSON.parse(body);
            console.log('Sending message to OpenAI:', message);
            const completion = await openai.chat.completions.create({
                messages: [{ role: "user", content: message }],
                model: "gpt-3.5-turbo",
            });
            const response = completion.choices[0].message.content;
            console.log('Received response from OpenAI:', response);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: response }));
        } catch (error) {
            console.error('Error:', error);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'An error occurred while processing your request.' }));
        }
    });
}

const PORT = 3000;
server.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));