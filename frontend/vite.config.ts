import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: { port: 5173, strictPort: true },
  build: {
    rollupOptions: {
      output: {
        // Las librerías cambian poco: separadas, el navegador las mantiene en caché entre despliegues
        manualChunks: {
          react: ['react', 'react-dom', 'react-router'],
          datos: ['@tanstack/react-query', 'axios'],
          formularios: ['react-hook-form', '@hookform/resolvers', 'zod'],
        },
      },
    },
  },
})
