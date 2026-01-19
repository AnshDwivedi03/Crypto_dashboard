// FILENAME: frontend/src/App.jsx
// LOCATION: Inside 'frontend' folder, then inside 'src' folder.

import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';
import { Activity, TrendingUp, TrendingDown, Clock, Zap, Database } from 'lucide-react';
import io from 'socket.io-client';

// --- CONFIGURATION ---
const SIMULATION_MODE = false; // Set to FALSE to use real data from backend

// NOTE: We use localhost for default.
// When you deploy to Vercel, you will set VITE_API_URL in Vercel settings.
// This line automatically handles switching between the two.
// If import.meta is not available (like in some previews), it falls back to localhost.
let SOCKET_URL = 'http://localhost:4000';
try {
  if (import.meta.env.VITE_API_URL) {
    SOCKET_URL = import.meta.env.VITE_API_URL;
  }
} catch (e) {
  // Ignore error if import.meta is missing in preview environment
}

// --- COMPONENTS ---

const GlassCard = ({ children, className = "" }) => (
  <motion.div
    className={`relative overflow-hidden bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl ${className}`}
  >
    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 opacity-50" />
    {children}
  </motion.div>
);

const StatCard = ({ symbol, price, prevPrice }) => {
  const isUp = price >= prevPrice;
  const percentage = prevPrice ? ((price - prevPrice) / prevPrice) * 100 : 0;

  return (
    <GlassCard className="p-6 flex flex-col justify-between h-40 group hover:bg-white/10 transition-colors">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-gray-400 text-sm font-semibold uppercase tracking-wider">{symbol}</h3>
          <h2 className="text-3xl font-bold text-white mt-1 font-mono">
            ${price?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
          </h2>
        </div>
        <div className={`p-2 rounded-full ${isUp ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
          {isUp ? <TrendingUp size={24} /> : <TrendingDown size={24} />}
        </div>
      </div>
      <div className="flex items-center gap-2 mt-4">
        <span className={`text-sm font-bold ${isUp ? 'text-green-400' : 'text-red-400'}`}>
          {isUp ? '+' : ''}{percentage.toFixed(2)}%
        </span>
      </div>
    </GlassCard>
  );
};

const MainChart = ({ history }) => {
  const [activeCoin, setActiveCoin] = useState('bitcoin');
  if (!history || history.length === 0) return null;

  const coinColors = { bitcoin: '#f7931a', ethereum: '#627eea', solana: '#14f195', dogecoin: '#c2a633' };
  const currentColor = coinColors[activeCoin] || '#8b5cf6';

  return (
    <GlassCard className="p-6 col-span-1 lg:col-span-2 min-h-[400px]">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Database size={20} className="text-pink-500" />
          Real-Time Volatility
        </h2>
        <div className="flex bg-black/20 p-1 rounded-lg">
          {Object.keys(coinColors).map(coin => (
            <button key={coin} onClick={() => setActiveCoin(coin)}
              className={`px-4 py-1.5 text-xs font-medium rounded-md capitalize transition-all ${activeCoin === coin ? 'bg-white/10 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}>
              {coin}
            </button>
          ))}
        </div>
      </div>
      <div className="h-[300px] w-full" style={{ height: 300, contentVisibility: 'auto' }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={history}>
            <defs>
              <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={currentColor} stopOpacity={0.3} />
                <stop offset="95%" stopColor={currentColor} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
            <XAxis dataKey="time" hide />
            <YAxis domain={['auto', 'auto']} stroke="#ffffff50" fontSize={12} tickFormatter={(val) => `$${val.toLocaleString()}`} />
            <Tooltip contentStyle={{ backgroundColor: '#0f0f12', border: '1px solid #333' }} itemStyle={{ color: currentColor }} />
            <Area type="monotone" dataKey={activeCoin} stroke={currentColor} strokeWidth={3} fillOpacity={1} fill="url(#colorPrice)" animationDuration={500} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </GlassCard>
  );
};

export default function App() {
  const [prices, setPrices] = useState({});
  const [prevPrices, setPrevPrices] = useState({});
  const [history, setHistory] = useState([]);

  useEffect(() => {
    // Connect to Backend
    console.log("Connecting to socket at:", SOCKET_URL);
    const socket = io(SOCKET_URL);

    socket.on('price_update', (data) => {
      // Parse incoming strings to numbers
      const parsedData = Object.fromEntries(Object.entries(data).map(([k, v]) => [k, parseFloat(v)]));

      setPrices(current => {
        setPrevPrices(current);
        return parsedData;
      });

      // Update Chart History
      setHistory(h => {
        const newPoint = {
          time: new Date().toLocaleTimeString(),
          bitcoin: parsedData.bitcoin,
          ethereum: parsedData.ethereum,
          solana: parsedData.solana,
          dogecoin: parsedData.dogecoin
        };
        // Keep only last 20 points to keep chart clean
        return [...h, newPoint].slice(-20);
      });
    });

    return () => socket.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-[#09090b] text-white p-6 md:p-12 font-sans selection:bg-purple-500/30">
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-cyan-600/10 rounded-full blur-[120px]" />
      </div>
      <div className="relative z-10 max-w-7xl mx-auto">
        <header className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-500">
            Crypto<span className="text-purple-500">Pulse</span>.
          </h1>
          <p className="text-gray-400 mt-2">Distributed Real-Time Market Monitor</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {Object.entries(prices).map(([symbol, price]) => (
            <StatCard key={symbol} symbol={symbol} price={price} prevPrice={prevPrices[symbol]} />
          ))}
          {Object.keys(prices).length === 0 && <div className="col-span-4 text-center text-gray-500 animate-pulse">Waiting for Stream...</div>}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <MainChart history={history} />
          <GlassCard className="p-6">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><Clock size={18} className="text-cyan-400" /> System Status</h3>
            <div className="space-y-4 text-sm text-gray-400">
              <div className="flex justify-between"><span>Backend:</span> <span className="text-green-400">Online</span></div>
              <div className="flex justify-between"><span>Transport:</span> <span className="text-blue-400">Socket.io</span></div>
              <div className="flex justify-between"><span>Queue:</span> <span className="text-yellow-400">RabbitMQ</span></div>
              <div className="flex justify-between"><span>Cache:</span> <span className="text-red-400">Redis</span></div>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}