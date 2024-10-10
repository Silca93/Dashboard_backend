require('dotenv').config();
const express = require('express');
const finnhub = require('finnhub');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT;
const cors = require('cors')

if (process.env.NODE_ENV !== 'production') {
  app.use(cors({
      origin: 
     //? Your frontend URL in development  
      'http://localhost:5173'

    //!Your frontend URL in production. Should point to the deployment frontend URL//
  // 'https://whataveritwillbe.onrender.com'

  }));
}
// Initialize Finnhub API Client
const api_key = finnhub.ApiClient.instance.authentications['api_key'];
api_key.apiKey = process.env.API_KEY;
const finnhubClient = new finnhub.DefaultApi();

// Function to get stock price
async function getSymbolPrice(symbol, callback) {
  try {
    finnhubClient.quote(symbol, (err, data, response) => {
      if (err) {
        console.error(err);
        callback(err, null);
      } else {
        console.log(`Stock Price for ${symbol}:`, data); // Log stock price data
        callback(null, data); // Return the stock price data
      }
    });
  } catch (error) {
    console.error(error);
    callback(error, null);
  }
}

// Function to get company profile
async function getCompanyProfile(symbol, callback) {
  try {
    finnhubClient.companyProfile2({ symbol }, (err, data, response) => {
      if (err) {
        console.error(err);
        callback(err, null);
      } else {
        console.log(`Company Profile for ${symbol}:`, data); // Log full company profile data
        callback(null, data); // Return the company profile data
      }
    });
  } catch (error) {
    console.error(error);
    callback(error, null);
  }
}

// API route to handle requests from the frontend
app.get('/api/stock/:symbol', (req, res) => {
  const symbol = req.params.symbol;

  // Fetch both stock price and company profile
  getSymbolPrice(symbol, (err, priceData) => {
    if (err) {
      return res.status(500).json({ error: 'Error fetching stock price' });
    }

    getCompanyProfile(symbol, (err, profileData) => {
      if (err) {
        return res.status(500).json({ error: 'Error fetching company profile' });
      }

      // Combine both price and profile data into a single response
      const stockData = {
        price: priceData,
        profile: profileData
      };

      res.json(stockData); // Send combined data as JSON response
    });
  });
});





app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend is working!' });
});

// Your existing functions...

app.get('/api/news', async (req, res) => {
  try {
    console.log('Received request for news'); // Debug log
    console.log('Using News API key:', process.env.VITE_API_URL_NEWS); // Debug log

    const response = await axios.get('https://newsapi.org/v2/top-headlines', {
      params: {
        country: 'us',
        apiKey: process.env.VITE_API_URL_NEWS
      }
    });
    
    console.log('Successfully fetched news data'); // Debug log
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching news:', error.response?.data || error.message);
    res.status(500).json({ 
      error: 'Failed to fetch news',
      details: error.response?.data || error.message 
    });
  }
});

// Your existing stock route...

// Add error handling middleware
app.use((req, res, next) => {
  console.log(`404 - Route not found: ${req.method} ${req.url}`); // Debug log
  res.status(404).json({ error: `Route ${req.url} not found` });
});





// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
