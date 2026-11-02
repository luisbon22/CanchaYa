import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    strictPort: true,
    // En desarrollo las llamadas a /api van al backend; en producción ambos comparten origen
    proxy: {
      '/api': 'http://localhost:8080',
    },
  },
  build: {
    // El build queda dentro de los recursos de Spring Boot y se empaqueta en el mismo jar
    outDir: '../src/main/resources/static',
    emptyOutDir: true,
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
