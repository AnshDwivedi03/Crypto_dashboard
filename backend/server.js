require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require("socket.io");
const cors = require('cors');
const { createClient } = require('redis');
const cron = require('node-cron');
const mongoose = require('mongoose');
const PriceData = require('./models/PriceData');

// --- Setup ---
const app = express();
app.use(cors());
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/crypto-db';
const PORT = process.env.PORT || 4000;

// --- Connections ---
const redisClient = createClient({ url: REDIS_URL });
redisClient.on('error', err => console.error('Redis Client Error', err));

mongoose.connect(MONGO_URI).then(() => console.log('[DB] Connected'));
redisClient.connect().then(() => console.log('[CACHE] Redis Connected'));

// --- Socket.io: Real-Time Emitter ---
// Poll Redis every 3 seconds and push to frontend
setInterval(async () => {
  try {
    const data = await redisClient.hGetAll('current_prices');
    if (Object.keys(data).length > 0) {
      io.emit('price_update', data);
    }
  } catch (err) {
    console.error('Redis read error:', err);
  }
}, 3000); 

// --- Cron Job: Daily Aggregation ---
// Runs at Midnight (00:00) every day
cron.schedule('0 0 * * *', async () => {
  console.log('[CRON] Running Daily Aggregation...');
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  
  const stats = await PriceData.aggregate([
    { $match: { timestamp: { $gte: yesterday }, type: 'raw' } },
    { $group: { _id: "$symbol", avgPrice: { $avg: "$price" }, maxPrice: { $max: "$price" }, minPrice: { $min: "$price" } } }
  ]);

  console.log('[CRON] Daily Stats Calculated:', stats);
});

// --- API Routes (Optional) ---
app.get('/', (req, res) => res.send('Crypto Backend is Running!'));

app.get('/history/:symbol', async (req, res) => {
  const { symbol } = req.params;
  const history = await PriceData.find({ symbol }).sort({ timestamp: -1 }).limit(50);
  res.json(history.reverse());
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});