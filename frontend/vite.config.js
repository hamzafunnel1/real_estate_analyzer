import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'https://real-estate-api-ejqg.onrender.com',
    },
  },
  preview: {
    host: '0.0.0.0',
    port: 4173,
    allowedHosts: ['real-estate-platform-wj7s.onrender.com'],
  },
})
