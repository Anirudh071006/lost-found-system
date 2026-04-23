import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  preview: {
    port: 10000,
    host: true,
    allowedHosts: ["lost-found-frontend-onf9.onrender.com"]
  }
})