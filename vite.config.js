import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    host: true,  // 开放所有本地IP
    port: 5173,  // 你可以设置你自己的端口号
    proxy: {
      '/api': {
        target: 'http://123.58.56.61',  // 你的后端 API 地址
        changeOrigin: true,  // 将请求的 Origin 修改为目标地址，避免 CORS 问题
        rewrite: (path) => path.replace(/^\/api/, ''),  // 如果后端路径不需要 /api 前缀
      },
    },
  },
})
