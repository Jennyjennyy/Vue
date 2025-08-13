<template>
  <div id="mapView" class="map-view"></div>
</template>

<script setup>
import { onMounted } from 'vue'
import { loadModules } from 'esri-loader'
import MapViewSingleton from '../mapviewSingleton'

onMounted(async () => {
  const [Map, MapView] = await loadModules([
    'esri/Map',
    'esri/views/MapView'
  ])

  const map = new Map({
    basemap: 'streets-navigation-vector'
  })

  const view = new MapView({
    container: 'mapView',
    map,
    center: [114.0579, 22.5431],  // 深圳中心经纬度
    zoom: 11
    
  })

  // 将 mapView 存储到单例模式中
  MapViewSingleton.setMapView(view)
})
</script>

<style scoped>
.map-view {
  width: 100%;
  height: 1000px;  /* 设定地图高度 */
}
</style>


