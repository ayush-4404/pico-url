const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();  // load .env variables
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
    try{
        await redisClient.connect();  
        console.log('Connected to Redis');
        await mongoose.connect(process.env.MONGO_URL);  // then MongoDB
        console.log('Connected to MongoDB');
        
        app.listen(3000, () => console.log('Server running on port 3000'));
    } catch(err){
        console.error('Error starting server:', err);
        process.exit(1);
    }
}

startServer();