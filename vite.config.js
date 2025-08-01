import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'



// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    host: true,
    port: 5173,  // 如果需要，你可以设置你自己的端口
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL,  // 设置目标服务器的地址
        changeOrigin: true,  // 改变请求头中的 Origin，避免 CORS 问题
        rewrite: (path) => path.replace(/^\/api/, ''),  // 去掉 /api 前缀
      },
    },
  },
})
