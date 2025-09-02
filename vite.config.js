import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/molliua': {
        target: 'https://www.molliua.com',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/molliua/, '')
      }
    }
  }
})
