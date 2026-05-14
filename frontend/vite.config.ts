import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// 원본 (pre-M3) 작업용 — 포트 5174 / 3001 (M3 데모와 분리)
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
    host: '0.0.0.0',
    port: 5174,
    allowedHosts: true,
    proxy: {
      // 본지 새 평론 이미지 → 본 dir 후단
      '/uploads/reviews': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
      },
      '/uploads/cities': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
      },
      // 기타 이미지 → 라이브 anjen.net
      '/uploads': {
        target: 'https://www.anjen.net',
        changeOrigin: true,
        secure: true,
      },
      // API → 본 dir 후단 (포트 3001), prefix 제거
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
        rewrite: (p) => p.replace(/^\/api/, ''),
      },
    },
  }
})
