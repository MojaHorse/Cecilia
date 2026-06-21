import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/liturgy': {
        target: 'http://calapi.inadiutorium.cz/api/v0/en/calendars/default',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/liturgy/, '')
      }
    }
  }
})
