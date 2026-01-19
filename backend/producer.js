require('dotenv').config();
const amqp = require('amqplib');
const axios = require('axios');

// --- Configuration ---
const AMQP_URL = process.env.RABBITMQ_URL || 'amqp://localhost';
const QUEUE_NAME = 'crypto-price-stream';
const COINS = ['bitcoin', 'ethereum', 'solana', 'dogecoin', 'cardano'];

const sleep = (ms) => new Promise(res => setTimeout(res, ms));

const fetchPrices = async (channel, retry = 0) => {
  try {
    const { data } = await axios.get(
      `https://api.coingecko.com/api/v3/simple/price?ids=${COINS.join(',')}&vs_currencies=usd&include_last_updated_at=true`
    );

    const messages = Object.entries(data).map(([coin, details]) => ({
      symbol: coin,
      price: details.usd,
      updatedAt: details.last_updated_at
    }));

    messages.forEach(msg => {
      channel.sendToQueue(QUEUE_NAME, Buffer.from(JSON.stringify(msg)));
    });

    console.log(`[PRODUCER] Sent update for ${messages.length} coins`);
  } catch (err) {
    if (err.response?.status === 429 && retry < 5) {
      const delay = Math.pow(2, retry) * 10000; // 10s, 20s, 40s, 80s...
      console.log(`[PRODUCER] Rate limited. Retrying in ${delay / 1000}s`);
      await sleep(delay);
      return fetchPrices(channel, retry + 1);
    }

    console.error('[PRODUCER] Error fetching data:', err.message);
  }
};

const run = async () => {
  try {
    const connection = await amqp.connect(AMQP_URL);
    const channel = await connection.createChannel();

    await channel.assertQueue(QUEUE_NAME, { durable: false });
    console.log('[PRODUCER] Connected to RabbitMQ');

    fetchPrices(channel);                      // run immediately
    setInterval(() => fetchPrices(channel), 60000); // every 1 minute

  } catch (error) {
    console.error('[PRODUCER] Connection Error:', error.message);
    setTimeout(run, 5000);
  }
};

run();
