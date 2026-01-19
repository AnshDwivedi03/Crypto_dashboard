require('dotenv').config();
const amqp = require('amqplib');
const axios = require('axios');

// --- Configuration ---
const AMQP_URL = process.env.RABBITMQ_URL || 'amqp://localhost';
const QUEUE_NAME = 'crypto-price-stream';
const COINS = ['bitcoin', 'ethereum', 'solana', 'dogecoin', 'cardano'];

const fetchPrices = async (channel) => {
  try {
    // Fetching from CoinGecko
    const { data } = await axios.get(
      `https://api.coingecko.com/api/v3/simple/price?ids=${COINS.join(',')}&vs_currencies=usd&include_last_updated_at=true`
    );

    const messages = Object.entries(data).map(([coin, details]) => ({
      symbol: coin,
      price: details.usd,
      updatedAt: details.last_updated_at
    }));

    // Send each coin update to the RabbitMQ Queue
    messages.forEach(msg => {
        const buffer = Buffer.from(JSON.stringify(msg));
        channel.sendToQueue(QUEUE_NAME, buffer);
    });

    console.log(`[PRODUCER] Sent update for ${messages.length} coins`);
  } catch (err) {
    console.error('[PRODUCER] Error fetching data:', err.message);
  }
};

const run = async () => {
  try {
    // 1. Connect to RabbitMQ
    const connection = await amqp.connect(AMQP_URL);
    const channel = await connection.createChannel();

    // 2. Ensure Queue Exists
    await channel.assertQueue(QUEUE_NAME, { durable: false });
    
    console.log('[PRODUCER] Connected to RabbitMQ');

    // 3. Start Loop
    fetchPrices(channel); // Run immediately
    setInterval(() => fetchPrices(channel),  60000); // Then every 1min

  } catch (error) {
    console.error('[PRODUCER] Connection Error:', error);
    // Retry logic could go here
    setTimeout(run, 5000);
  }
};

run();