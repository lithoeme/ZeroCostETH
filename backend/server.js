const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

// Serve static files from the frontend directory
const serveStaticFiles = (req, res) => {
    let filePath = path.join(__dirname, '..', 'frontend', req.url);

    // If the request is for the root, serve index.html
    if (req.url === '/') {
        filePath = path.join(__dirname, '..', 'frontend', 'index.html');
    }

    // Determine the file type based on the extension
    const extname = path.extname(filePath);
    let contentType = 'text/html';
    if (extname === '.js') {
        contentType = 'application/javascript';
    } else if (extname === '.css') {
        contentType = 'text/css';
    }

    // Read the file and send the response
    fs.readFile(filePath, (err, content) => {
        if (err) {
            // Send error response if the file is not found
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end('Error loading static files: ' + err.message);
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content);
        }
    });
};

// Create an HTTP server
const server = http.createServer((req, res) => {
    // Serve static files (CSS, JS, and HTML)
    if (req.url.startsWith('/frontend')) {
        serveStaticFiles(req, res);
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
    } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
    }
});

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
