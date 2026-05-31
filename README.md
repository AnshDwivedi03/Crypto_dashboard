<p align="center">
  <h1 align="center">💎 CryptoPulse</h1>
  <p align="center">
    <strong>Distributed Real-Time Cryptocurrency Market Monitor</strong>
  </p>
  <p align="center">
    A production-grade, event-driven crypto dashboard built with a modern distributed systems architecture — featuring real-time price streaming, message queuing, caching, and a beautiful glassmorphism UI.
  </p>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=white" />
  <img src="https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=node.js&logoColor=white" />
  <img src="https://img.shields.io/badge/RabbitMQ-FF6600?style=for-the-badge&logo=rabbitmq&logoColor=white" />
  <img src="https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white" />
  <img src="https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white" />
  <img src="https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=socket.io&logoColor=white" />
</p>

---

## 📖 Table of Contents

- [About](#-about)
- [Architecture](#-architecture)
- [Tech Stack](#-tech-stack)
- [Features](#-features)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Project Structure](#-project-structure)
- [Deployment](#-deployment)
- [API Reference](#-api-reference)
- [Author](#-author)

---

## 🧠 About

**CryptoPulse** is a full-stack, distributed real-time cryptocurrency dashboard that monitors live prices for **Bitcoin**, **Ethereum**, **Solana**, **Dogecoin**, and **Cardano**. It demonstrates a professional-grade event-driven architecture using message queues, an in-memory cache layer, persistent storage, and WebSocket-based real-time streaming to the frontend.

This project showcases how modern distributed systems concepts — producers, consumers, message brokers, caching layers, cron-based aggregation, and real-time data delivery — come together to build a scalable data pipeline.

---

## 🏗 Architecture

```
┌─────────────────┐        ┌──────────────┐        ┌─────────────────┐
│   CoinGecko API │───────▶│   PRODUCER   │───────▶│    RabbitMQ     │
│  (Price Source)  │  HTTP  │ (Fetcher)    │  AMQP  │ (Message Queue) │
└─────────────────┘        └──────────────┘        └────────┬────────┘
                                                            │
                                                            ▼
                                                   ┌──────────────┐
                                                   │   CONSUMER   │
                                                   │ (Processor)  │
                                                   └──┬────────┬──┘
                                                      │        │
                                              ┌───────▼──┐  ┌──▼────────┐
                                              │  Redis    │  │  MongoDB  │
                                              │ (Cache)   │  │ (Storage) │
                                              └───────┬───┘  └───────────┘
                                                      │
                                                      ▼
                                              ┌──────────────┐
                                              │   SERVER     │
                                              │ Express +    │
                                              │ Socket.io    │
                                              └──────┬───────┘
                                                     │ WebSocket
                                                     ▼
                                              ┌──────────────┐
                                              │   FRONTEND   │
                                              │  React + Vite│
                                              └──────────────┘
```

### Data Flow

1. **Producer** fetches live prices from the [CoinGecko API](https://www.coingecko.com/) every 60 seconds
2. Price data is published to a **RabbitMQ** message queue
3. **Consumer** reads from the queue and writes to:
   - **Redis** — for ultra-fast current price lookups (cache layer)
   - **MongoDB** — for persistent historical storage
4. **Server** polls Redis every 3 seconds and emits updates via **Socket.io**
5. **React frontend** receives real-time WebSocket updates and renders live charts

---

## 🛠 Tech Stack

### Backend
| Technology | Purpose |
|---|---|
| **Node.js + Express** | REST API server & WebSocket host |
| **RabbitMQ (amqplib)** | Message broker for decoupled producer-consumer pipeline |
| **Redis** | In-memory cache for current prices (fast reads) |
| **MongoDB (Mongoose)** | Persistent storage for historical price data |
| **Socket.io** | Real-time bidirectional communication with frontend |
| **node-cron** | Scheduled daily price aggregation jobs |
| **Axios** | HTTP client for CoinGecko API requests |

### Frontend
| Technology | Purpose |
|---|---|
| **React 19** | UI library with hooks-based state management |
| **Vite** | Next-generation frontend build tool |
| **Recharts** | Composable charting library for price visualizations |
| **Framer Motion** | Smooth animations and transitions |
| **Lucide React** | Beautiful, consistent icon set |
| **Tailwind CSS v4** | Utility-first CSS framework |
| **Socket.io Client** | Real-time data streaming from backend |

---

## ✨ Features

- 📡 **Real-Time Price Streaming** — Live WebSocket updates every 3 seconds
- 📊 **Interactive Charts** — Beautiful area charts with per-coin filtering (Bitcoin, Ethereum, Solana, Dogecoin)
- 💹 **Price Change Indicators** — Instant up/down trend detection with percentage changes
- 🎨 **Glassmorphism UI** — Stunning dark-mode interface with glass-effect cards and gradient accents
- 🔄 **Event-Driven Architecture** — Decoupled producer-consumer pattern via RabbitMQ
- ⚡ **Redis Caching Layer** — Sub-millisecond reads for current prices
- 🗄️ **Persistent Storage** — MongoDB for historical data and time-range queries
- ⏰ **Cron Aggregation** — Daily midnight job to compute min/max/avg statistics
- 🔁 **Auto-Reconnection** — Resilient connections with automatic retry logic
- 🛡️ **Rate Limit Handling** — Exponential backoff for API rate limits
- 📱 **Responsive Design** — Fully responsive layout for mobile, tablet, and desktop
- 🚀 **Production Ready** — Deployment configs for Vercel (frontend) and Render (backend)

---

## 🚀 Getting Started

### Prerequisites

Make sure you have the following installed:

- **Node.js** (v18 or higher)
- **MongoDB** (local instance or [MongoDB Atlas](https://www.mongodb.com/atlas))
- **Redis** (local instance or [Redis Cloud](https://redis.com/))
- **RabbitMQ** (local instance or [CloudAMQP](https://www.cloudamqp.com/))

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/AnshDwivedi03/Crypto_dashboard.git
   cd Crypto_dashboard
   ```

2. **Set up the backend**
   ```bash
   cd backend
   npm install
   ```

3. **Set up the frontend**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Configure environment variables** — Create a `.env` file in the `backend/` directory (see [Environment Variables](#-environment-variables))

5. **Start the backend** (starts producer, consumer, and server)
   ```bash
   cd backend
   npm start
   ```

6. **Start the frontend** (in a separate terminal)
   ```bash
   cd frontend
   npm run dev
   ```

7. **Open the dashboard** at `http://localhost:5173`

---

## 🔐 Environment Variables

Create a `.env` file inside the `backend/` directory:

```env
# MongoDB Connection
MONGO_URI=mongodb://localhost:27017/crypto-db

# Redis Connection
REDIS_URL=redis://localhost:6379

# RabbitMQ Connection
RABBITMQ_URL=amqp://localhost

# Server Port
PORT=4000
```

For the frontend (set in Vercel or a `.env` file in `frontend/`):

```env
# Backend API URL (for production deployment)
VITE_API_URL=https://your-backend-url.onrender.com
```

---

## 📁 Project Structure

```
Crypto_dashboard/
├── backend/
│   ├── models/
│   │   └── PriceData.js        # Mongoose schema for price data
│   ├── consumer.js              # RabbitMQ consumer — writes to Redis & MongoDB
│   ├── producer.js              # Fetches prices from CoinGecko → publishes to RabbitMQ
│   ├── server.js                # Express + Socket.io server with cron jobs
│   ├── index.js                 # Entry point — orchestrates all backend services
│   ├── render.yaml              # Render deployment configuration
│   ├── package.json
│   └── .gitignore
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── App.jsx              # Main dashboard component (charts, cards, layout)
│   │   ├── App.css
│   │   ├── index.css            # Global styles
│   │   └── main.jsx             # React entry point
│   ├── vercel.json              # Vercel deployment configuration
│   ├── vite.config.js           # Vite configuration
│   ├── tailwind.config.js       # Tailwind CSS configuration
│   ├── package.json
│   └── .gitignore
│
└── README.md
```

---

## ☁️ Deployment

### Frontend → Vercel

1. Push the repository to GitHub
2. Import the project on [Vercel](https://vercel.com)
3. Set the **Root Directory** to `frontend`
4. Add the environment variable `VITE_API_URL` pointing to your deployed backend URL
5. Deploy!

### Backend → Render

1. Push the repository to GitHub
2. Create a new **Web Service** on [Render](https://render.com)
3. Set the **Root Directory** to `backend`
4. Configure environment variables (`MONGO_URI`, `REDIS_URL`, `RABBITMQ_URL`, `PORT`)
5. The `render.yaml` is pre-configured for one-click deployment

### Managed Services (Recommended for Production)

| Service | Provider |
|---|---|
| MongoDB | [MongoDB Atlas](https://www.mongodb.com/atlas) (Free Tier available) |
| Redis | [Redis Cloud](https://redis.com/) (Free Tier available) |
| RabbitMQ | [CloudAMQP](https://www.cloudamqp.com/) (Free Tier available) |

---

## 📡 API Reference

### `GET /`
Health check endpoint.

**Response:** `Crypto Backend is Running!`

### `GET /history/:symbol`
Retrieve historical price data for a specific cryptocurrency.

**Parameters:**
| Parameter | Type | Description |
|---|---|---|
| `symbol` | `string` | Cryptocurrency name (e.g., `bitcoin`, `ethereum`) |

**Response:** Array of the last 50 price data points (sorted by time, ascending).

```json
[
  {
    "_id": "...",
    "symbol": "bitcoin",
    "price": 68423.50,
    "currency": "usd",
    "timestamp": "2025-05-31T12:00:00.000Z",
    "type": "raw"
  }
]
```

### WebSocket Events

| Event | Direction | Description |
|---|---|---|
| `price_update` | Server → Client | Emitted every 3 seconds with current prices for all tracked coins |

---

## 👨‍💻 Author

**Ansh Dwivedi**

- GitHub: [@AnshDwivedi03](https://github.com/AnshDwivedi03)

---

## 📄 License

This project is licensed under the **ISC License**.

---

<p align="center">
  <strong>⭐ Star this repo if you found it useful!</strong>
</p>
