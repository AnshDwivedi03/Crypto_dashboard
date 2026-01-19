const { fork } = require('child_process');
const path = require('path');

console.log('[SYSTEM] Starting Crypto Monitor System...');

// 1. Start the Producer (Data Fetcher) in a separate process
const producer = fork(path.join(__dirname, 'producer.js'));
producer.on('error', (err) => console.error('[PRODUCER] Error:', err));

// 2. Start the Consumer (Data Processor) in a separate process
const consumer = fork(path.join(__dirname, 'consumer.js'));
consumer.on('error', (err) => console.error('[CONSUMER] Error:', err));

// 3. Start the Main Server (API + Socket.io + Cron)
require('./server.js');

console.log('[SYSTEM] All services launched.');