// Function to fetch data from an API
async function fetchData(url) {
    try {
        const response = await fetch(url, {
            headers: {
                'Accept': 'application/json',
                'User-Agent': 'Mozilla/5.0' // Some APIs require this
            }
        });
        if (response.status === 401) {
            throw new Error('Unauthorized access. Please check API usage or permissions.');
        }
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching data:', error);
        return null;
    }
}

// Function to fetch Ethereum data from CoinGecko with daily interval
async function fetchEthereumData(interval = 'daily', days = 30) {
    const url = `https://api.coingecko.com/api/v3/coins/ethereum/market_chart?vs_currency=usd&days=${days}&interval=${interval}`;
    const data = await fetchData(url);

    if (data) {
        console.log('Fetched data:', data); // Log the fetched data
        const prices = data.prices.map(price => price[1]); // Extract price data
        return prices;
    } else {
        console.error('No data returned from API');
        return [];
    }
}

// Linear regression function
function linearRegression(xValues, yValues) {
    const n = xValues.length;
    const sumX = xValues.reduce((sum, x) => sum + x, 0);
    const sumY = yValues.reduce((sum, y) => sum + y, 0);
    const sumXY = xValues.reduce((sum, x, i) => sum + x * yValues[i], 0);
    const sumX2 = xValues.reduce((sum, x) => sum + x * x, 0);

    const m = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const b = (sumY - m * sumX) / n;

    return { m, b };
}

// Prediction function
function predict(x, m, b) {
    return m * x + b;
}

// Function to predict Ethereum movement
async function predictEthereumMovement(interval = 'daily', days = 365) {
    console.log('Fetching data...');
    document.getElementById('prediction').innerText = 'Loading...';
    document.getElementById('accuracy').innerText = '';

    const prices = await fetchEthereumData(interval, days);

    // Check if there are enough data points for prediction
    if (prices.length < 10) {
        console.error('Not enough data for prediction.');
        document.getElementById('prediction').innerText = 'Not enough data for prediction.';
        document.getElementById('accuracy').innerText = '';
        return;
    }

    console.log('Data fetched:', prices);  // Log the fetched prices

    // Divide the data into training and test sets
    const halfIndex = Math.floor(prices.length / 2);
    const trainPrices = prices.slice(0, halfIndex);
    const testPrices = prices.slice(halfIndex);

    // Prepare the x and y values for training
    const xValuesTrain = Array.from({ length: trainPrices.length }, (_, i) => i);
    const yValuesTrain = trainPrices;

    const { m, b } = linearRegression(xValuesTrain, yValuesTrain);

    // Prepare the test data for prediction
    const xValuesTest = Array.from({ length: testPrices.length }, (_, i) => halfIndex + i);
    let correctPredictions = 0;

    // Compare predictions with actual movements
    for (let i = 0; i < testPrices.length - 1; i++) {
        const predictedPrice = predict(xValuesTest[i], m, b);
        const actualMovement = testPrices[i + 1] - testPrices[i];
        const predictedMovement = predictedPrice - testPrices[i];

        if ((predictedMovement > 0 && actualMovement > 0) || (predictedMovement < 0 && actualMovement < 0)) {
            correctPredictions++;
        }
    }

    // Calculate accuracy, ensuring no division by zero
    const accuracy = testPrices.length > 1 ? (correctPredictions / (testPrices.length - 1)) * 100 : 0;

    // Display the prediction and accuracy
    const lastPrice = prices[prices.length - 1];
    const predictedPrice = predict(prices.length, m, b);
    const movement = predictedPrice > lastPrice ? 'up' : 'down';

    document.getElementById('prediction').innerText = `Predicted movement by end of day: ${movement}`;
    document.getElementById('accuracy').innerText = `Model accuracy: ${accuracy.toFixed(2)}%`;
}

// Call the function to make the prediction
predictEthereumMovement();
