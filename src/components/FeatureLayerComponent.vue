<template>
  <a-tree
    v-model:checkedKeys="checkedKeys"
    checkable
    :tree-data="treeData"
    @check="onCheck"
    style="height: 100px; width: 200px; position: absolute; top: 20px; left: 20px; overflow: auto;"
  />
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { loadModules } from 'esri-loader'
import MapViewSingleton from '../mapviewSingleton'

const treeData = [
  {
    title: '图层控制',
    key: 'layer', 
    children: [
      {
        title: '网格图层',
        key: 'grid-layer',
      }
    ]
  }
]

const checkedKeys = ref([])  
let featureLayer = null;


// 勾选状态变化时
const onCheck = async (checkedKeysValue) => {
  console.log('[FeatureLayerComponent] onCheck triggered, checkedKeysValue:', checkedKeysValue)  // 调试输出
  checkedKeys.value = checkedKeysValue  // 更新 checkedKeys

  const view = MapViewSingleton.getMapView() 
  if (!view) {
    console.warn('[FeatureLayerComponent] mapView is not ready')
    return
  }

  const [FeatureLayer] = await loadModules(['esri/layers/FeatureLayer'])

  // 如果 FeatureLayer 还没有创建，就创建它
  if (!featureLayer) {
    featureLayer = new FeatureLayer({
      url: '/api/api/map-79/arcgis/rest/services/keti/MapServer/0',
      id: 'grid-layer'  
    });
    // 设置图层渲染器，使其透明
    featureLayer.renderer = {
  type: 'simple',
  symbol: {
    type: 'simple-fill',
    color: [255, 0, 0, 0], 
    outline: {
      color: [255, 255, 255, 1],
      width: 1
    }
  }
}


  }

  console.log('checkedKeysValue:', checkedKeysValue)

  featureLayer.opacity = 1  // 确保图层完全可见
  featureLayer.visible = true  // 确保图层可见

  // 如果勾选了该图层，加载图层
  if (checkedKeysValue.includes('grid-layer')) {
    console.log('checkedKeysValue includes grid-layer')
    if (!view.map.findLayerById('grid-layer')) {
      view.map.add(featureLayer)
      console.log('网格图层已添加')
    }
  } else {
    const existingLayer = view.map.findLayerById('grid-layer')
    if (existingLayer) {
      view.map.remove(existingLayer)
      console.log('网格图层已移除')
    }
  }
  // 在这里添加点击事件
  view.on('click', (event) => {
    view.hitTest(event).then((response) => {
      if (response.results.length) {
        const grid = response.results.filter(result => result.graphic.layer === featureLayer)[0];
        if (grid) {
          const gridInfo = grid.graphic.attributes; // 获取网格的属性
          console.log('点击的网格信息：', gridInfo);  // 打印网格信息
        }
      }
    });
  });
}
</script>

<style scoped>
</style>


