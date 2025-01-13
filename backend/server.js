const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

// Function to serve static files (HTML, JS)
const serveStaticFiles = (req, res) => {
    let filePath = path.join(__dirname, '..', 'frontend', req.url);

    if (req.url === '/') {
        filePath = path.join(__dirname, '..', 'frontend', 'index.html');
    }

    const extname = path.extname(filePath);
    let contentType = 'text/html';

    if (extname === '.js') {
        contentType = 'application/javascript';
    } else if (extname === '.css') {
        contentType = 'text/css';
    }

    fs.readFile(filePath, (err, content) => {
        if (err) {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('File Not Found');
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content);
        }
    });
};

// Handle the Ethereum price request
const getEthereumPrice = (req, res) => {
    if (req.url === '/api/price' && req.method === 'GET') {
        // CORS header to allow all origins
        res.setHeader('Access-Control-Allow-Origin', '*'); // Allow requests from any origin
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

        https.get('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd', (apiRes) => {
            let data = '';

            apiRes.on('data', chunk => {
                data += chunk;
            });

            apiRes.on('end', () => {
                try {
                    const parsedData = JSON.parse(data);
                    const price = parsedData.ethereum.usd;
                    const timestamp = new Date().toISOString();

                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({
                        price: price,
                        timestamp: timestamp
                    }));
                } catch (error) {
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Error parsing data' }));
                }
            });
        }).on('error', (err) => {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Error fetching data' }));
        });
    }
};

// Create HTTP server
const server = http.createServer((req, res) => {
    // Serve static files
    if (req.url.startsWith('/frontend')) {
        serveStaticFiles(req, res);
    }
    // Serve Ethereum price data
    else {
        getEthereumPrice(req, res);
    }
});

// Start the server
const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
