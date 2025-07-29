import { createApp } from 'vue'
import App from './App.vue'

// 引入 Ant Design Vue 组件库和样式
import Antd from 'ant-design-vue'
import 'ant-design-vue/dist/reset.css'



const app = createApp(App)
app.use(Antd)
app.mount('#app')


