import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ command }) => ({
  plugins: [react()],
  server: { 
    port: 5173,
    headers: {
      'Cache-Control': 'no-store'
    }
  },
  // Use '/' for dev, '/moneydash/' for production
  base: command === 'serve' ? '/' : '/moneydash/'
}))
