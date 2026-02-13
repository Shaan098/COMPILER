🚀 Online Code Compiler.

A full-stack MERN application that allows users to write, compile, and run code in **C, C++, Python, Java, and JavaScript** directly in the browser.

✨ Features..

- **Multi-Language Support**: C, C++, Python, Java, JavaScript.
- **Monaco Editor**: Professional VS Code-like editor with syntax highlighting.
- **User Authentication**: Register/Login to save your code history.
- **Code History**: View all your past submissions.
- **Share Code**: Generate shareable links for your code.
- **Modern Dark UI**: Beautiful, responsive interface.

## 🛠️ Tech Stack

| Component      | Technology              |
| -------------- | ----------------------- |
| Frontend       | React + Vite            |
| Backend        | Node.js + Express       |
| Database       | MongoDB                 |
| Code Execution | Groq AI (LLaMA 3.3 70B) |
| Authentication | JWT                     |

## ⚙️ Configuration & Dev Tips

- Frontend communicates with the backend using the `VITE_API_URL` environment variable.
  - Default: `http://localhost:5000/api`.
  - If the backend starts on a different port (e.g. 5001 due to port conflicts), the client
    will automatically retry using the alternate port thanks to a network-fallback built into
    `client/src/config/api.js`.
  - You can also override the URL manually in a `.env` file at the root of the `client` folder:
    ```
    VITE_API_URL=http://localhost:5000/api
    ```
- Backend listens on port `5000` by default and will attempt to increment the port if
  `EADDRINUSE` occurs. If you encounter "Error running code" in the UI, make sure the
  server is reachable or set `VITE_API_URL` accordingly.
  THANK YOU...
