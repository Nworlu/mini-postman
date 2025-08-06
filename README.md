# 📨 Mini Postman Clone (React + Vite, No Backend)

This is a lightweight Postman-style tool built with **React** and **Vite**. It allows you to create, send, and store mock HTTP requests — all within your browser using `localStorage`.

## 🚀 Features

- Send mock HTTP requests (GET, POST, etc.)
- Save request history using `localStorage`
- Edit, delete, and re-use requests
- Built with React + Vite for fast performance
- 100% frontend — no backend or APIs required

## 🔧 Tech Stack

- [React](https://reactjs.org/)
- [Vite](https://vitejs.dev/)
- JavaScript
- `localStorage` for persistence

## ⚠️ CORS & Proxy Info

Since this app is entirely frontend-based, **you may encounter CORS (Cross-Origin Resource Sharing) errors** when making real API requests to external servers.

To help with local development, you can set up a proxy in the Vite config (`vite.config.js`) like this:

```js
// vite.config.js
export default defineConfig({
  server: {
    proxy: {
      "/api": {
        target: "https://your-api-domain.com",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
});
```
