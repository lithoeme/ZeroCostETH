const http = require('http');
const fs = require('fs');
const path = require('path');
const https = require('https');

// Function to enable CORS for all requests
const enableCORS = (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
};

// Function to serve static files (HTML, JS, CSS)
const serveStaticFiles = (req, res) => {
    console.log(`Handling static file request: ${req.url}`);  // Log to check if the function is being entered
    console.log(`Request URL: ${req.url}`); // Log the incoming request URL

    let filePath = path.join(__dirname, '..', 'frontend', req.url);

    if (req.url === '/') {
        filePath = path.join(__dirname, '..', 'frontend', 'index.html');
    } else if (req.url.startsWith('/js') || req.url.startsWith('/css')) {
        filePath = path.join(__dirname, '..', 'frontend', req.url);
    }

    console.log(`Resolved file path: ${filePath}`);  // Log the resolved file path for debugging

    fs.readFile(filePath, (err, content) => {
        if (err) {
            console.error(`Error reading file: ${filePath}`);
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

            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content);
        }
    });
};


// Function to handle Ethereum price request
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

                    enableCORS(req, res);  // Apply CORS headers for the API response

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

    // Log all incoming requests for debugging
    console.log(`Received request: ${req.method} ${req.url}`);

    // Check if the request is for static files or API route
    if (req.url === '/' || req.url.startsWith('/js') || req.url.startsWith('/css')) {
        console.log(`Routing to static file handler`);
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
