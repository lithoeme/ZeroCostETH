const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

// Create an HTTP server
const server = http.createServer((req, res) => {
    // Serve frontend files if the URL matches the root or static assets (e.g., JS, CSS)
    if (req.url === '/' || req.url.startsWith('/frontend/js') || req.url.startsWith('/frontend/css')) {
        const filePath = path.join(__dirname, '..', 'frontend', req.url === '/' ? 'index.html' : req.url);

        const extname = path.extname(filePath);
        let contentType = 'text/html';
        if (extname === '.js') {
            contentType = 'application/javascript';
        } else if (extname === '.css') {
            contentType = 'text/css';
        }

        fs.readFile(filePath, (err, content) => {
            if (err) {
                res.writeHead(500);
                res.end('Error loading file');
            } else {
                res.writeHead(200, { 'Content-Type': contentType });
                res.end(content);
            }
        });
    }
    // API endpoint to fetch Ethereum price and timestamp
    else if (req.url === '/api/price' && req.method === 'GET') {
        https.get('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd', (apiRes) => {
            let data = '';

            // Collect the response data
            apiRes.on('data', chunk => {
                data += chunk;
            });

            apiRes.on('end', () => {
                try {
                    // Parse the response from CoinGecko API
                    const parsedData = JSON.parse(data);
                    const price = parsedData.ethereum.usd;

                    // Get current timestamp
                    const timestamp = new Date().toISOString();

                    // Send the response back to the client
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
    } else {
        // Handle 404 for unmatched routes
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
    }
});

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
