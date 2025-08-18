<template>
  <div class="app-container">
    <button class="launch-btn" @click="launchApp">模拟平台</button>
    <h1 class="page-title">城市不均衡时空数据可视分析与综合模拟平台</h1>

    <ListData :gridData="selectedGridData" />
    <Map @mapViewReady="handleMapViewReady" />
    <FeatureLayerComponent @grid-clicked="handleGridClick" />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import Map from './components/Map.vue'
import FeatureLayerComponent from './components/FeatureLayerComponent.vue'
import ListData from './components/ListData.vue'

const mapViewReady = ref(false)
const selectedGridData = ref(null)  

function handleMapViewReady(view) {
  import('./mapviewSingleton').then(module => {
    module.default.setMapView(view)
    mapViewReady.value = true
  })
}

//  接收 FeatureLayerComponent 传出的点击数据
function handleGridClick(data) {
  console.log('接收到网格数据:', data)
  selectedGridData.value = data
  
}
function launchApp() {
  window.location.href = 'TestQ:' // 你在注册表中定义的协议名
}
</script>

<style scoped>
.app-container {
  font-family: 'Arial', sans-serif;
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.page-title {
  position: fixed;
  top: 0;
  width: 100%;
  text-align: center;
  background-color: #fff;
  padding: 20px 0;
  font-size: 24px;
  font-weight: bold;
  color: #2c3e50;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  z-index: 1000;
}
.launch-btn {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1001;
  padding: 8px 16px;
  background-color: white;
  color: #2c3e50;
  border: 2px solid #2c3e50;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(0,0,0,0.1);
  transition: background-color 0.3s, color 0.3s;
}

.launch-btn:hover {
  background-color: #2c3e50;
  color: white;
}
</style>

