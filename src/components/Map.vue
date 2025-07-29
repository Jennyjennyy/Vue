<template>
  <div id="mapView" class="map-view"></div>
</template>

<script setup>
import { onMounted } from 'vue'
import { loadModules } from 'esri-loader'

onMounted(async () => {
  const [Map, MapView] = await loadModules([
    'esri/Map',
    'esri/views/MapView'
  ])
  const map = new Map({
    basemap: 'streets-navigation-vector'
  })

  new MapView({
    container: "mapView",
    map: map,
    center: [114.0579, 22.5431], // 深圳中心经纬度
    zoom: 11,
    ui: {
      components: []
    }
  })
})
</script>

<style scoped>
.map-view {
  position: absolute;
  top: 80px;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 0;
}
</style>
