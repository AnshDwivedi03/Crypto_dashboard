require('dotenv').config();
const amqp = require('amqplib');
const mongoose = require('mongoose');
const { createClient } = require('redis');
const PriceData = require('./models/PriceData');

// --- Configuration ---
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/crypto-db';
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
const AMQP_URL = process.env.RABBITMQ_URL || 'amqp://localhost';
const QUEUE_NAME = 'crypto-price-stream';

// --- Redis Setup ---
const redisClient = createClient({ url: REDIS_URL });
redisClient.on('error', err => console.error('[REDIS] Client Error', err));

const run = async () => {
  try {
    // 1. Connect Services
    await mongoose.connect(MONGO_URI);
    console.log('[DB] MongoDB Connected');
    
    await redisClient.connect();
    console.log('[CACHE] Redis Connected');

    // 2. Connect to RabbitMQ
    const connection = await amqp.connect(AMQP_URL);
    const channel = await connection.createChannel();
    await channel.assertQueue(QUEUE_NAME, { durable: false });
    
    console.log('[CONSUMER] Connected to RabbitMQ & Listening...');

    // 3. Process Stream
    channel.consume(QUEUE_NAME, async (msg) => {
        if (msg !== null) {
            const content = JSON.parse(msg.content.toString());
            const { symbol, price } = content;

            console.log(`[PROCESSING] ${symbol}: $${price}`);

            // A. FAST LAYER: Update Redis
            await redisClient.hSet('current_prices', symbol, price);

            // B. STORAGE LAYER: Save to MongoDB
            // Optimization: In production, batch these writes.
            await PriceData.create({
                symbol,
                price,
                timestamp: new Date()
            });

            // Acknowledge message (tell RabbitMQ we are done)
            channel.ack(msg);
        }
    });

  } catch (error) {
    console.error('[CONSUMER] Error:', error);
    setTimeout(run, 5000);
  }
};

run();