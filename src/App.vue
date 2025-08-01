<template>
  <div class="app-container">
    <h1 class="page-title">城市不均衡时空数据融合与空间画像分析平台</h1>
    
    <!-- ListData 始终渲染 -->
    <ListData />

    <!-- 只有 mapViewReady 为 true 时渲染 FeatureLayerComponent -->
    <Map @mapViewReady="handleMapViewReady" />
    <FeatureLayerComponent />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import Map from './components/Map.vue'
import FeatureLayerComponent from './components/FeatureLayerComponent.vue'
import ListData from './components/ListData.vue'

const mapViewReady = ref(false)

function handleMapViewReady(view) {
  import('./mapviewSingleton').then(module => {
    module.default.setMapView(view)  // 存储 mapView
    mapViewReady.value = true         // 激活 FeatureLayerComponent
  })
}
</script>

<style scoped>
.app-container {
  padding-top: 120px;
  font-family: 'Arial', sans-serif;
  height: 100vh;
  display: flex;
  flex-direction: column;
}
.tree-container {
  position: absolute;
  top: 0;    /* 距离顶部0px */
  right: 0;   /* 距离右边0px */
  width: 200px;  /* 树形控件的宽度 */
  height: 100%;  /* 高度填满页面 */
  z-index: 10;  /* 确保树形控件在其他元素之上 */
  background-color: #f7f7f7;  /* 背景颜色 */
  border-left: 1px solid #ccc;  /* 分隔线 */
  padding: 10px;  /* 内边距 */
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
</style>
