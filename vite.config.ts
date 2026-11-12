import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // API는 상대 경로(/api/...)로 호출한다. 배포에서는 프론트와 백엔드가 같은 도메인이라 그대로 동작하고,
    // 로컬 개발(npm run dev)에서는 아래 프록시가 로컬 백엔드로 넘겨준다.
    proxy: {
      '/api': 'http://localhost:8080',
      '/internal': 'http://localhost:8080',
    },
  },
})
