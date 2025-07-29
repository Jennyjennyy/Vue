<template>
  <div class="app-container">
    <h1 class="page-title">城市不均衡时空数据融合与空间画像分析平台</h1>
    <Map></Map>
    <ListData></ListData>
    </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import Map from './components/Map.vue';
import ListData from './components/ListData.vue';

</script>

<style scoped>
.app-container {
  padding-top: 120px;
  font-family: 'Arial', sans-serif;
  box-sizing: border-box;
  height: 100vh; /* 使父容器占据屏幕全部高度 */
  display: flex;
  flex-direction: column;
}

/* 顶部标题 */
.page-title {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  text-align: center;
  background-color: #ffffff;
  padding: 20px 0;
  font-size: 24px;
  font-weight: bold;
  color: #2c3e50;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  z-index: 1000;
}


</style>

