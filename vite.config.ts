import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Configuração do Vite para bundling do React com proxy para a API local
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // Proxy: redireciona chamadas /api do frontend para o backend Express
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
  // Aponta para o tsconfig dedicado ao frontend (com JSX)
  // O tsconfig.json raiz é exclusivo do backend (Node.js)
})
