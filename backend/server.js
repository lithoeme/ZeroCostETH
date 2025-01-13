const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

// Function to enable CORS for all requests
const enableCORS = (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*'); // You can replace '*' with a specific domain if required.
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
};

// Function to serve static files (HTML, JS, CSS)
const serveStaticFiles = (req, res) => {
    // Adjusted file path to serve files from the 'frontend' folder
    let filePath = path.join(__dirname, 'frontend', req.url === '/' ? 'index.html' : req.url);

    console.log(`Serving file: ${filePath}`); // Log the file path to troubleshoot

    fs.readFile(filePath, (err, content) => {
        if (err) {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('File Not Found');
        } else {
            const extname = path.extname(filePath);
            let contentType = 'text/html';
            if (extname === '.js') {
                contentType = 'application/javascript';
            } else if (extname === '.css') {
                contentType = 'text/css';
            }

            enableCORS(req, res);  // Apply CORS headers before serving content
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content);
        }
    });
};

// Handle the Ethereum price request
const getEthereumPrice = (req, res) => {
    if (req.url === '/api/price' && req.method === 'GET') {
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

                    enableCORS(req, res);  // Ensure CORS headers are applied before sending JSON data

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
    // Apply CORS headers to all requests
    enableCORS(req, res);

    // Serve static files (HTML, JS, CSS)
    if (req.url === '/' || req.url.startsWith('/frontend')) {
        serveStaticFiles(req, res);
    } else {
        // Handle Ethereum price request
        getEthereumPrice(req, res);
    }
});

// Get port from environment variables or default to 8080
const PORT = process.env.PORT || 8080;
server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});
