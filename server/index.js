const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
require('dotenv').config();  // also load server/.env if it exists

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());  // Enable CORS for all routes
// Middleware to parse JSON requests
app.use(express.json());

app.use('/', require('./routes/url'));  // mount the URL routes
app.use('/auth', require('./routes/auth'));

// Sample route
app.get('/', (req, res) => {
    res.send('pico-url running');
});


const redisClient = require('./config/redis');

async function startServer() {
    try {
        await redisClient.connect();  
        console.log('Connected to Redis');
        const mongoUri = process.env.MONGO_URL || 'mongodb://127.0.0.1:27017/picourl';
        await mongoose.connect(mongoUri);  // then MongoDB
        console.log('Connected to MongoDB');
        
        app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    } catch (err) {
        console.error('Error starting server:', err);
        process.exit(1);
    }
}

startServer();