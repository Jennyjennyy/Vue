<template>
  <div class="sidebar">
    <a-tree
      v-model:checkedKeys="checkedKeys"
      checkable
      :tree-data="treeData"
      @check="onCheck"
      class="tree-panel"
    />
  </div>
</template>


<script setup>
import { ref, watch, onMounted } from 'vue'
import { loadModules } from 'esri-loader'
import MapViewSingleton from '../mapviewSingleton'
const emit = defineEmits(['grid-clicked'])

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
      url: 'https://2d-arcgis-dev.cloud.cityworks.cn/arcgis/rest/services/keti/Mapserver/0',
      id: 'grid-layer',
      outFields: ['*']
    });
    featureLayer.when(() => {
  const fieldNames = featureLayer.fields.map(f => f.name)
  console.log('图层字段名列表:', fieldNames)
  
  featureLayer.queryFeatures({
    where: "_服务业 IS NOT NULL AND _服务业 <> 0",
    outFields: ['FID', '_服务业', 'name'],
    returnGeometry: false
  }).then((results) => {
    const features = results.features
    console.log('有 _服务业 数据的网格数量:', features.length)

    features.forEach(f => {
      const attrs = f.attributes
      console.log(`FID: ${attrs.FID}, name: ${attrs.name}, _服务业: ${attrs._服务业}`)
    })
  }).catch(err => {
    console.error('查询 _服务业 字段失败:', err)
  })
})
  

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
    
  featureLayer.queryFeatures({
    where: '1=1',
    outFields: ['*'],
    returnGeometry: false
  }).then((results) => {
    const features = results.features
    console.log('有数据的网格数量:', features.length)

    if (features.length > 0) {
      console.log('第一个网格的属性字段:', Object.keys(features[0].attributes))
      console.log('第一个网格的属性值:', features[0].attributes)
    } else {
      console.log('没有任何网格有属性数据')
    }
  })

    }
    
  } else {
    const existingLayer = view.map.findLayerById('grid-layer')
    if (existingLayer) {
      view.map.remove(existingLayer)
      console.log('网格图层已移除')
    }
  }
  let highlightHandle = null; 

view.on('click', async (event) => {
  const response = await view.hitTest(event);

  if (response.results.length) {
    const grid = response.results.find(result => result.graphic.layer === featureLayer);

    if (grid) {
      const graphic = grid.graphic;
      const gridInfo = graphic.attributes;
      console.log('点击的网格信息：', gridInfo);

      emit('grid-clicked', gridInfo);

      // 清除之前的高亮
      if (highlightHandle) {
        highlightHandle.remove();
        highlightHandle = null;
      }

      // 获取图层视图并高亮当前 graphic
      const layerView = await view.whenLayerView(featureLayer);
      highlightHandle = layerView.highlight(graphic);

      view.goTo({
        target: graphic,
        zoom: 15 
      }).catch((error) => {
        console.warn('视图跳转失败：', error);
      });
    }
  }
});

}
</script>

<style scoped>
.sidebar {
  position: fixed;
  top: 65px;
  left: 0;
  width: 240px;         
  height: 100vh;        
  background-color: #fff;
  box-shadow: 2px 0 6px rgba(0, 0, 0, 0.1);
  z-index: 1001;       
  padding: 20px;
  overflow-y: auto;
}

.tree-panel {
  height: 100%;
}
</style>


