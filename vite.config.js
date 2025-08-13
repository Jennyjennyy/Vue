import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'



// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    host: true,
    port: 5173,  // 如果需要，你可以设置你自己的端口
    proxy: {
  '/gis': {
    target: 'http://123.58.56.61/api',
    changeOrigin: true,
    rewrite: path => path.replace(/^\/gis/, ''),
  }
}

  },
})
console.log('VITE_API_URL:', process.env.VITE_API_URL);
