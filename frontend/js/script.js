document.addEventListener('DOMContentLoaded', function() {
    console.log('Website is ready!');
});

// Function to fetch the current Ethereum price
function updatePrice() {
    console.log('Fetching Ethereum price...');
    fetch('https://zerocosteth.onrender.com/api/price')
        .then(response => {
            if (!response.ok) {
                console.error('Failed to fetch data:', response.statusText);
                throw new Error('Failed to fetch data');
            }
            return response.json();
        })
        .then(data => {
            console.log('Price data:', data);
            const price = data.price;
            const timestamp = new Date(data.timestamp).toLocaleTimeString();
            document.getElementById('eth-price').innerText = `Ethereum Price: $${price} (Updated at ${timestamp})`;
        })
        .catch(error => {
            console.error('Error:', error);
            document.getElementById('eth-price').innerText = 'Error fetching price';
        });
}


setInterval(updatePrice, 30000);  // Update every 10 seconds