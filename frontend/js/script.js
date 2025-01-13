document.addEventListener('DOMContentLoaded', function() {
    console.log('Website is ready!');
});

// Function to fetch the current Ethereum price
function fetchEthereumPrice() {
    fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd')  // API to get Ethereum price in USD
        .then(response => response.json())  // Convert the response to JSON
        .then(data => {
            // Update the Ethereum price on the page
            const ethPrice = data.ethereum.usd;
            const currentTime = new Date().toLocaleTimeString(); // Get current time
            document.getElementById('eth-price').innerText = `Ethereum Price: $${ethPrice} (Updated at ${currentTime})`;
        })
        .catch(error => {
            // Handle any errors that occur during the fetch
            document.getElementById('eth-price').innerText = 'Error fetching price';
        });
}

// Fetch the price every 30 seconds (30000 milliseconds)
setInterval(fetchEthereumPrice, 30000);

// Initial fetch when the page loads
fetchEthereumPrice();
