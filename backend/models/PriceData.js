const mongoose = require('mongoose');

const PriceDataSchema = new mongoose.Schema({
  symbol: { type: String, required: true, index: true },
  price: { type: Number, required: true },
  currency: { type: String, default: 'usd' },
  timestamp: { type: Date, default: Date.now, index: true },
  type: { type: String, enum: ['raw', 'daily_aggregate'], default: 'raw' }
});

// Index for fast time-range queries (e.g., "Give me Bitcoin prices for the last 24h")
PriceDataSchema.index({ symbol: 1, timestamp: -1 });

module.exports = mongoose.model('PriceData', PriceDataSchema);