import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // All /api/* requests are proxied to the backend
      // The /api prefix is stripped before forwarding
      // e.g. /api/auth/login  → http://localhost:3000/auth/login
      //      /api/url         → http://localhost:3000/url
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
})
