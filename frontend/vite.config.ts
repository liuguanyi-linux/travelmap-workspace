import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    target: 'es2015',
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'amap-vendor': ['@amap/amap-jsapi-loader'],
          'ui-vendor': ['lucide-react', 'framer-motion'],
          'utils-vendor': ['axios', 'firebase/app', 'firebase/analytics', 'firebase/auth', 'firebase/firestore']
        }
      }
    },
    chunkSizeWarningLimit: 1500
  },
  server: {
    host: '0.0.0.0', // Listen on all local IPs
    port: 5173,
    allowedHosts: true,
  }
})
