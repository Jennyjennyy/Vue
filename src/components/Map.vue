<template>
  <div class="map-container">
    <!-- 地图容器 -->
    <div id="mapView" class="map-view"></div>
    
    <!-- 底图切换控件 -->
    <div class="basemap-switcher">
      <a-radio-group v-model:value="selectedBasemap" @change="switchBasemap">
        <a-radio :style="radioStyle" :value="'vector'">电子地图</a-radio>
        <a-radio :style="radioStyle" :value="'satellite'">影像地图</a-radio>
      </a-radio-group>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, reactive } from 'vue'
import { loadModules } from 'esri-loader'
import MapViewSingleton from '../mapviewSingleton'

const token = 'd4462ed810272eb0431ae7bde6451f6f'

// RadioGroup 样式和数据
const selectedBasemap = ref('vector')
const radioStyle = reactive({
  display: 'flex',
  height: '30px',
  lineHeight: '30px',
})

// 地图相关变量
let map = null
let view = null
let layers = {
  vector: [],
  satellite: []
}

onMounted(async () => {
  const [Map, MapView, WebTileLayer] = await loadModules([
    'esri/Map',
    'esri/views/MapView',
    'esri/layers/WebTileLayer'
  ])

  // 创建天地图矢量底图图层
  const vecLayer = new WebTileLayer(`http://{subDomain}.tianditu.gov.cn/vec_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=vec&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILECOL={col}&TILEROW={row}&TILEMATRIX={level}&tk=${token}`, {
    subDomains: ['t0','t1','t2','t3','t4','t5','t6','t7']
  })

  // 创建天地图矢量注记图层
  const cvaLayer = new WebTileLayer(`http://{subDomain}.tianditu.gov.cn/cva_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=cva&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILECOL={col}&TILEROW={row}&TILEMATRIX={level}&tk=${token}`, {
    subDomains: ['t0','t1','t2','t3','t4','t5','t6','t7']
  })

  // 创建天地图影像底图图层
  const imgLayer = new WebTileLayer(`http://{subDomain}.tianditu.gov.cn/img_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=img&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILECOL={col}&TILEROW={row}&TILEMATRIX={level}&tk=${token}`, {
    subDomains: ['t0','t1','t2','t3','t4','t5','t6','t7']
  })

  // 创建天地图影像注记图层
  const ciaLayer = new WebTileLayer(`http://{subDomain}.tianditu.gov.cn/cia_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=cia&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILECOL={col}&TILEROW={row}&TILEMATRIX={level}&tk=${token}`, {
    subDomains: ['t0','t1','t2','t3','t4','t5','t6','t7']
  })

  // 存储图层组合
  layers.vector = [vecLayer, cvaLayer]
  layers.satellite = [imgLayer, ciaLayer]

  // 创建地图对象，默认使用矢量底图
  map = new Map({
    layers: layers.vector,
    logo: false
  })

  // 创建视图
  view = new MapView({
    container: 'mapView',
    map,
    center: [114.0579, 22.5431],  // 深圳中心经纬度
    zoom: 11,
    constraints: {
      minZoom: 3,
      maxZoom: 18
    },
    ui: {
      components: [] // 可添加 zoom、compass 等
    }
  })

  // 存储到单例
  MapViewSingleton.setMapView(view)
})

// 切换底图的方法
const switchBasemap = () => {
  if (!map) return
  
  // 清除当前图层
  map.removeAll()
  
  // 添加选中的图层组合
  if (selectedBasemap.value === 'vector') {
    layers.vector.forEach(layer => map.add(layer))
  } else if (selectedBasemap.value === 'satellite') {
    layers.satellite.forEach(layer => map.add(layer))
  }
}
</script>

<style scoped>
.map-container {
  position: relative;
  width: 100%;
  height: 1000px;
}

.map-view {
  width: 100%;
  height: 100%;
}

.basemap-switcher {
  position: absolute;
  bottom: 15px;
  left: 15px;
  background: white;
  padding: 10px;
  border-radius: 6px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  z-index: 1000;
}

.basemap-switcher :deep(.ant-radio-group) {
  display: flex;
  flex-direction: column;
  gap: 5px;
}
</style>




