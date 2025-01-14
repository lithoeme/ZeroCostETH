document.addEventListener('DOMContentLoaded', function() {
    console.log('Website is ready!');
});

// Function to fetch the current Ethereum price
function updatePrice() {
    fetch('https://zerocosteth.onrender.com/api/price')
        .then(response => response.json())
        .then(data => {
            const price = data.price;
            const timestamp = new Date(data.timestamp).toLocaleTimeString();
            document.getElementById('eth-price').innerText = `Ethereum Price: $${price} (Updated at ${timestamp})`;
        })
        .catch(error => console.error('Error:', error));
}

setInterval(updatePrice, 30000);  // Update every 30 seconds