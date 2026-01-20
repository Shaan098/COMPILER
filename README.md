# 🚀 Online Code Compiler

A full-stack MERN application that allows users to write, compile, and run code in **C, C++, Python, Java, and JavaScript** directly in the browser.

## ✨ Features

- **Multi-Language Support**: C, C++, Python, Java, JavaScript
- **Monaco Editor**: Professional VS Code-like editor with syntax highlighting
- **User Authentication**: Register/Login to save your code history
- **Code History**: View all your past submissions
- **Share Code**: Generate shareable links for your code
- **Modern Dark UI**: Beautiful, responsive interface

## 🛠️ Tech Stack

| Component | Technology |
|-----------|------------|
| Frontend | React + Vite |
| Backend | Node.js + Express |
| Database | MongoDB |
| Code Editor | Monaco Editor |
| Code Execution | Judge0 API (RapidAPI) |
| Authentication | JWT |

## 📋 Prerequisites

1. **Node.js** (v18 or higher)
2. **MongoDB** (local or [MongoDB Atlas](https://www.mongodb.com/atlas))
3. **RapidAPI Key** for Judge0 (free tier available)

## 🔧 Setup Instructions

### 1. Get Judge0 API Key (FREE)

1. Go to [RapidAPI](https://rapidapi.com)
2. Sign up for a free account
3. Search for "Judge0 CE"
4. Subscribe to the free tier
5. Copy your API key from the "X-RapidAPI-Key" header

### 2. Configure Environment Variables

Edit `server/.env`:

```env
MONGODB_URI=mongodb://localhost:27017/online-compiler
JWT_SECRET=your-secret-key-here
JUDGE0_API_KEY=your-rapidapi-key-here
JUDGE0_API_URL=https://judge0-ce.p.rapidapi.com
PORT=5000
```

### 3. Start MongoDB

Make sure MongoDB is running locally, or update `MONGODB_URI` with your Atlas connection string.

### 4. Start the Backend

```bash
cd server
npm install
npm run dev
```

Server runs at: `http://localhost:5000`

### 5. Start the Frontend

```bash
cd client
npm install
npm run dev
```

Frontend runs at: `http://localhost:5173`

## 🎯 Usage

1. Open `http://localhost:5173` in your browser
2. Select a programming language
3. Write your code in the editor
4. Click "Run Code" to compile and execute
5. View output (green = success, red = error)

## 📁 Project Structure

```
COMPILER/
├── client/                 # React Frontend
│   ├── src/
│   │   ├── components/     # UI Components
│   │   ├── context/        # Auth Context
│   │   └── pages/          # Page Components
│   └── package.json
│
├── server/                 # Express Backend
│   ├── models/             # MongoDB Models
│   ├── routes/             # API Routes
│   ├── middleware/         # Auth Middleware
│   ├── server.js           # Entry Point
│   └── .env                # Configuration
│
└── README.md
```

## 🔒 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/compile/run` | Compile and run code |
| GET | `/api/compile/share/:id` | Get shared code |
| POST | `/api/auth/register` | User registration |
| POST | `/api/auth/login` | User login |
| GET | `/api/submissions/my` | Get user's history |

## 📝 Language IDs (Judge0)

| Language | ID |
|----------|-----|
| C | 50 |
| C++ | 54 |
| Python | 71 |
| Java | 62 |
| JavaScript | 63 |

## 🎓 Created For

Final Year Project - Online Code Compiler

## 📄 License

MIT License
