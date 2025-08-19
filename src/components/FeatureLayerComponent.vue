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
import { ref, onMounted } from 'vue'
import { loadModules } from 'esri-loader'
import MapViewSingleton from '../mapviewSingleton' // 确保这个路径是正确的

const emit = defineEmits(['grid-clicked'])

const treeData = [
  {
    title: '图层控制',
    key: 'layer',
    children: [
      {
        title: '网格图层',
        key: 'grid-layer',
      },
      {
        title: 'NDVI专题图',
        key: 'ndvi-layer'
      },
      {
        title: 'PM2.5专题图',
        key: 'pm25-layer'
      },
      {
        title: '房价专题图',
        key: 'fangjia-layer'
      },
      {
  title: '2020 GDP 专题图',
  key: 'gdp-layer'
},
      {
        title: '建筑体积专题图',
        key: 'volume-layer'
      }
    ]
  }
]

const checkedKeys = ref([])
let featureLayer = null
let ndviLayer = null
let legendInstance = null // 用于追踪唯一的图例实例
let pm25Layer = null;
let pm25LegendInstance = null;
let fangjiaLayer = null;
let fangjiaLegendInstance = null;
let gdpLayer = null;
let gdpLegendInstance = null;
let volumeLayer = null
let volumeLegendInstance = null // 为建筑体积单独创建一个图例实例




// 在 onMounted 中设置一次性的事件监听
onMounted(() => {
  // 确保 MapView 已经初始化完成
  const setupEventListeners = () => {
    const view = MapViewSingleton.getMapView()
    if (!view) {
      // 如果 view 还没准备好，稍后再试
      setTimeout(setupEventListeners, 100)
      return
    }

    let highlightHandle = null // 高亮句柄只在此作用域内需要

    // 点击事件监听器只在这里注册一次
    view.on('click', async (event) => {
      // 只有当网格图层存在且可见时，才执行点击逻辑
      if (!featureLayer || !view.map.findLayerById('grid-layer')) {
        return
      }

      const response = await view.hitTest(event)
      if (response.results.length) {
        const grid = response.results.find(result => result.graphic.layer === featureLayer)

        if (grid) {
          const graphic = grid.graphic
          const gridInfo = graphic.attributes
          console.log('点击的网格信息：', gridInfo)

          emit('grid-clicked', gridInfo)

          // 清除之前的高亮
          if (highlightHandle) {
            highlightHandle.remove()
          }

          // 高亮当前点击的要素
          const layerView = await view.whenLayerView(featureLayer)
          if (layerView) {
            highlightHandle = layerView.highlight(graphic)
          }

          // 视图跳转
          view.goTo({
            target: graphic,
            zoom: 15
          }).catch((error) => {
            if (error.name !== "AbortError") {
               console.warn('视图跳转失败：', error)
            }
          })
        }
      }
    })
  }
  
  setupEventListeners()
})


// 勾选状态变化时，只处理图层的添加/移除和图例的显隐
const onCheck = async (checkedKeysValue) => {
  console.log('[FeatureLayerComponent] onCheck triggered, checkedKeysValue:', checkedKeysValue)
  checkedKeys.value = checkedKeysValue

  const view = MapViewSingleton.getMapView()
  if (!view) {
    console.warn('[FeatureLayerComponent] mapView is not ready')
    return
  }

  const [FeatureLayer, Legend] = await loadModules([
    'esri/layers/FeatureLayer',
    'esri/widgets/Legend'
  ])

  // --- 1. 处理网格图层 ---
  if (!featureLayer) {
    featureLayer = new FeatureLayer({
      url: 'https://2d-arcgis-dev.cloud.cityworks.cn/arcgis/rest/services/keti/Mapserver/0',
      id: 'grid-layer',
      outFields: ['*'],
      // 设置透明的填充和白色的轮廓
      renderer: {
        type: 'simple',
        symbol: {
          type: 'simple-fill',
          color: [0, 0, 0, 0], // 完全透明
          outline: {
            color: [220, 220, 220, 0.8], // 半透明白色/灰色轮廓
            width: 1
          }
        }
      }
    })
  }

  const gridLayerExists = view.map.findLayerById('grid-layer')
  if (checkedKeysValue.includes('grid-layer')) {
    if (!gridLayerExists) {
      view.map.add(featureLayer)
      console.log('网格图层已添加')
    }
  } else {
    if (gridLayerExists) {
      view.map.remove(gridLayerExists)
      console.log('网格图层已移除')
    }
  }

  // --- 2. 处理 NDVI 图层和图例 ---
  const ndviLayerExists = view.map.findLayerById('ndvi-layer')
  if (checkedKeysValue.includes('ndvi-layer')) {
    if (!ndviLayerExists) {
      if (!ndviLayer) {
        const ndviRenderer = {
          type: 'class-breaks',
          field: 'UrbanDat_7',
          classBreakInfos: [
            
            {
              minValue: 0.1,
              maxValue: 0.2,
              label: '0.1-0.2',
              symbol: {
                type: 'simple-fill',
                color: '#d9d9d9', // 灰色
                outline: { width: 0.5, color: '#999' }
              }
            },
            {
              minValue: 0.2,
              maxValue: 0.4,
              label: '0.2-0.4',
              symbol: {
                type: 'simple-fill',
                color: '#c2e699', // 浅绿
                outline: { width: 0.5, color: '#666' }
              }
            },
            {
              minValue: 0.4,
              maxValue: 0.6,
              label: '0.4-0.6',
              symbol: {
                type: 'simple-fill',
                color: '#78c679', // 中绿
                outline: { width: 0.5, color: '#333' }
              }
            },
            {
              minValue: 0.6,
              maxValue: 0.8,
              label: '0.6-0.8',
              symbol: {
                type: 'simple-fill',
                color: '#31a354', // 深绿
                outline: { width: 0.5, color: '#333' }
              }
            },
            {
              minValue: 0.8,
              maxValue: 1,
              label: '0.8-1',
              symbol: {
                type: 'simple-fill',
                color: '#006837', // 墨绿
                outline: { width: 0.5, color: '#333' }
              }
            }
          ]
        };
        ndviLayer = new FeatureLayer({
          url: 'https://2d-arcgis-dev.cloud.cityworks.cn/arcgis/rest/services/keti/Mapserver/0',
          id: 'ndvi-layer',
          outFields: ['*'],
          renderer: ndviRenderer
        })
      }
      view.map.add(ndviLayer)
      console.log('NDVI专题图层已添加')
    }

    // 如果图例不存在，则创建它
    if (!legendInstance) {
      legendInstance = new Legend({
        view: view,
        layerInfos: [{
          layer: ndviLayer,
          title: 'NDVI专题图'
        }]
      })
      view.ui.add(legendInstance, 'bottom-left')
      console.log('图例已创建')
    }
  } else {
    // 如果取消勾选 NDVI 图层
    if (ndviLayerExists) {
      view.map.remove(ndviLayerExists)
      console.log('NDVI专题图层已移除')
    }
    // 同时，如果图例存在，则移除并销毁它
    if (legendInstance) {
      view.ui.remove(legendInstance)
      legendInstance.destroy()
      legendInstance = null // 重置实例变量
      console.log('图例已移除')
    }
  }

  // --- 3. 处理 PM2.5 图层和图例 ---
const pm25LayerExists = view.map.findLayerById('pm25-layer');
if (checkedKeysValue.includes('pm25-layer')) {
  if (!pm25LayerExists) {
    if (!pm25Layer) {
      const pm25Renderer = {
        type: 'class-breaks',
        field: 'UrbanDat_8', 
        classBreakInfos: [
          {
            minValue: 0,
            maxValue: 16.5,
            label: '0-16.5',
            symbol: {
              type: 'simple-fill',
              color: '#A8E6CF', // 浅绿色
              outline: { width: 0.5, color: '#666' }
            }
          },
          {
            minValue: 16.5,
            maxValue: 18.5,
            label: '16.5-18.5',
            symbol: {
              type: 'simple-fill',
              color: '#81C784', // 浅黄色
              outline: { width: 0.5, color: '#666' }
            }
          },
          {
            minValue: 18.5,
            maxValue: 20,
            label: '18.5-20',
            symbol: {
              type: 'simple-fill',
              color: '#4CAF50', // 黄色
              outline: { width: 0.5, color: '#666' }
            }
          },
          {
            minValue: 20,
            maxValue: 21.5,
            label: '20-21.5',
            symbol: {
              type: 'simple-fill',
              color: '#FFEB3B', // 橙色
              outline: { width: 0.5, color: '#333' }
            }
          },
          {
            minValue: 21.5,
            maxValue: 50,
            label: '21.5-50',
            symbol: {
              type: 'simple-fill',
              color: '#F44336', // 橙红色
              outline: { width: 0.5, color: '#333' }
            }
          },
          
        ]
      };

      pm25Layer = new FeatureLayer({
        url: 'https://2d-arcgis-dev.cloud.cityworks.cn/arcgis/rest/services/keti/Mapserver/0',
        id: 'pm25-layer',
        outFields: ['*'], // 确保 PM2.5 字段被包含
        renderer: pm25Renderer,
        
      });
    }
    view.map.add(pm25Layer);
    console.log('PM2.5专题图层已添加');
  }

  // 如果 PM2.5 的图例不存在，则创建它
  if (!pm25LegendInstance) {
    pm25LegendInstance = new Legend({
      view: view,
      layerInfos: [{
        layer: pm25Layer,
        title: 'PM2.5 浓度分布'
      }]
    });
    view.ui.add(pm25LegendInstance, 'bottom-left'); 
    console.log('PM2.5图例已创建');
  }
} else {
  // 如果取消勾选 PM2.5 图层
  if (pm25LayerExists) {
    view.map.remove(pm25LayerExists);
    console.log('PM2.5专题图层已移除');
  }
  // 同时，如果图例存在，则移除并销毁它
  if (pm25LegendInstance) {
    view.ui.remove(pm25LegendInstance);
    pm25LegendInstance.destroy();
    pm25LegendInstance = null; // 重置实例变量
    console.log('PM2.5图例已移除');
  }
}

// --- 4. 处理房价图层和图例 ---
const fangjiaLayerExists = view.map.findLayerById('fangjia-layer');
if (checkedKeysValue.includes('fangjia-layer')) {
  if (!fangjiaLayerExists) {
    if (!fangjiaLayer) {
      const fangjiaRenderer = {
        type: 'class-breaks',
        field: 'UrbanDat_3', 
        classBreakInfos: [
          {
            minValue: 0,
            maxValue: 30000,
            label: '低房价 (0-30k)',
            symbol: {
              type: 'simple-fill',
              color: '#edf8fb',
              outline: { width: 0.5, color: '#666' }
            }
          },
          {
            minValue: 30000,
            maxValue: 45000,
            label: '中低房价 (30k-45k)',
            symbol: {
              type: 'simple-fill',
              color: '#b2e2e2',
              outline: { width: 0.5, color: '#666' }
            }
          },
          {
            minValue: 45000,
            maxValue: 60000,
            label: '中房价 (45k-60k)',
            symbol: {
              type: 'simple-fill',
              color: '#66c2a4',
              outline: { width: 0.5, color: '#666' }
            }
          },
          {
            minValue: 60000,
            maxValue: 75000,
            label: '中高房价 (60k-75k)',
            symbol: {
              type: 'simple-fill',
              color: '#2ca25f',
              outline: { width: 0.5, color: '#333' }
            }
          },
          {
            minValue: 75000,
            maxValue: 95000,
            label: '高房价 (75k-95k)',
            symbol: {
              type: 'simple-fill',
              color: '#006d2c',
              outline: { width: 0.5, color: '#333' }
            }
          }
        ]
      };

      fangjiaLayer = new FeatureLayer({
        url: 'https://2d-arcgis-dev.cloud.cityworks.cn/arcgis/rest/services/keti/Mapserver/0',
        id: 'fangjia-layer',
        outFields: ['*'],
        renderer: fangjiaRenderer,
        opacity: 0.75
      });
    }
    view.map.add(fangjiaLayer);
    console.log('房价专题图层已添加');
  }

  if (!fangjiaLegendInstance) {
    fangjiaLegendInstance = new Legend({
      view: view,
      layerInfos: [{
        layer: fangjiaLayer,
        title: '房价分布'
      }]
    });
    view.ui.add(fangjiaLegendInstance, 'bottom-left'); // 避免和其他图例冲突
    console.log('房价图例已创建');
  }
} else {
  if (fangjiaLayerExists) {
    view.map.remove(fangjiaLayerExists);
    console.log('房价专题图层已移除');
  }
  if (fangjiaLegendInstance) {
    view.ui.remove(fangjiaLegendInstance);
    fangjiaLegendInstance.destroy();
    fangjiaLegendInstance = null;
    console.log('房价图例已移除');
  }
}

// --- 5. 处理 GDP 图层和图例 ---
const gdpLayerExists = view.map.findLayerById('gdp-layer');
if (checkedKeysValue.includes('gdp-layer')) {
  if (!gdpLayerExists) {
    if (!gdpLayer) {
      const gdpRenderer = {
        type: 'class-breaks',
        field: 'UrbanDat_2',
        legendOptions: {
          title: '2020年GDP（亿元）'
        },
        classBreakInfos: [
          {
            minValue: 0,
            maxValue: 1,
            label: '0-1',
            symbol: {
              type: 'simple-fill',
              color: '#ffffcc',
              outline: { width: 0.5, color: '#999' }
            }
          },
          {
            minValue: 1,
            maxValue: 5,
            label: '1-5',
            symbol: {
              type: 'simple-fill',
              color: '#ffcc66',
              outline: { width: 0.5, color: '#999' }
            }
          },
          {
            minValue: 5,
            maxValue: 15,
            label: '5-15',
            symbol: {
              type: 'simple-fill',
              color: '#ff9966',
              outline: { width: 0.5, color: '#999' }
            }
          },
          {
            minValue: 15,
            maxValue: 30,
            label: '15-30',
            symbol: {
              type: 'simple-fill',
              color: '#cc6699',
              outline: { width: 0.5, color: '#666' }
            }
          },
          {
            minValue: 30,
            maxValue: 50,
            label: '30-50',
            symbol: {
              type: 'simple-fill',
              color: '#660099',
              outline: { width: 0.5, color: '#666' }
            }
          },
          {
            minValue: 50,
            maxValue: 77,
            label: '50-77',
            symbol: {
              type: 'simple-fill',
              color: '#4B0082',
              outline: { width: 0.5, color: '#333' }
            }
          }
        ]
      };

      gdpLayer = new FeatureLayer({
        url: 'https://2d-arcgis-dev.cloud.cityworks.cn/arcgis/rest/services/keti/Mapserver/0',
        id: 'gdp-layer',
        outFields: ['*'],
        renderer: gdpRenderer,
        opacity: 0.75
      });
    }
    view.map.add(gdpLayer);
    console.log('GDP专题图层已添加');
  }

  if (!gdpLegendInstance) {
    gdpLegendInstance = new Legend({
      view: view,
      layerInfos: [{
        layer: gdpLayer,
        title: '2020 GDP 分布'
      }]
    });
    view.ui.add(gdpLegendInstance, 'bottom-left'); // 避免和其他图例冲突
    console.log('GDP图例已创建');
  }
} else {
  if (gdpLayerExists) {
    view.map.remove(gdpLayerExists);
    console.log('GDP专题图层已移除');
  }
  if (gdpLegendInstance) {
    view.ui.remove(gdpLegendInstance);
    gdpLegendInstance.destroy();
    gdpLegendInstance = null;
    console.log('GDP图例已移除');
  }
}

// --- 处理建筑体积图层和图例 ---
const volumeLayerExists = view.map.findLayerById('volume-layer');
if (checkedKeysValue.includes('volume-layer')) {
  if (!volumeLayerExists) {
    if (!volumeLayer) {
      const volumeRenderer = {
        type: 'class-breaks',
        field: 'UrbanDat_1',
        classBreakInfos: [
          {
            minValue: 0,
            maxValue: 1000,
            label: '0–1000 m³',
            symbol: {
              type: 'simple-fill',
              color: '#ffffcc',
              outline: { width: 0.5, color: '#666' }
            }
          },
          {
            minValue: 1000,
            maxValue: 2000,
            label: '1000–2000 m³',
            symbol: {
              type: 'simple-fill',
              color: '#ffeb99',
              outline: { width: 0.5, color: '#666' }
            }
          },
          {
            minValue: 2000,
            maxValue: 3000,
            label: '2000–3000 m³',
            symbol: {
              type: 'simple-fill',
              color: '#ffcc66',
              outline: { width: 0.5, color: '#666' }
            }
          },
          {
            minValue: 3000,
            maxValue: 4000,
            label: '3000–4000 m³',
            symbol: {
              type: 'simple-fill',
              color: '#ffb366',
              outline: { width: 0.5, color: '#666' }
            }
          },
          {
            minValue: 4000,
            maxValue: 5000,
            label: '4000–5000 m³',
            symbol: {
              type: 'simple-fill',
              color: '#ff9966',
              outline: { width: 0.5, color: '#666' }
            }
          },
          {
            minValue: 5000,
            maxValue: 6000,
            label: '5000–6000 m³',
            symbol: {
              type: 'simple-fill',
              color: '#cc6699',
              outline: { width: 0.5, color: '#666' }
            }
          },
          {
            minValue: 6000,
            maxValue: 7000,
            label: '6000–7000 m³',
            symbol: {
              type: 'simple-fill',
              color: '#9933cc',
              outline: { width: 0.5, color: '#666' }
            }
          },
          {
            minValue: 7000,
            maxValue: 8000,
            label: '7000–8000 m³',
            symbol: {
              type: 'simple-fill',
              color: '#660099',
              outline: { width: 0.5, color: '#666' }
            }
          },
          {
            minValue: 8000,
            maxValue: 8100,
            label: '8000–8100 m³',
            symbol: {
              type: 'simple-fill',
              color: '#330066',
              outline: { width: 0.5, color: '#666' }
            }
          }
        ]
      };

      volumeLayer = new FeatureLayer({
        url: 'https://2d-arcgis-dev.cloud.cityworks.cn/arcgis/rest/services/keti/Mapserver/0',
        id: 'volume-layer',
        outFields: ['*'],
        renderer: volumeRenderer,
        
      });
    }
    view.map.add(volumeLayer);
    console.log('建筑体积专题图层已添加');
  }

  if (!volumeLegendInstance) {
    volumeLegendInstance = new Legend({
      view: view,
      layerInfos: [{
        layer: volumeLayer,
        title: '建筑体积分布（m³）'
      }]
    });
    view.ui.add(volumeLegendInstance, 'bottom-left'); 
    console.log('建筑体积图例已创建');
  }
} else {
  if (volumeLayerExists) {
    view.map.remove(volumeLayerExists);
    console.log('建筑体积专题图层已移除');
  }
  if (volumeLegendInstance) {
    view.ui.remove(volumeLegendInstance);
    volumeLegendInstance.destroy();
    volumeLegendInstance = null;
    console.log('建筑体积图例已移除');
  }
}

}
</script>

<style scoped>
.sidebar {
  position: fixed;
  top: 65px;
  left: 0;
  width: 240px;
  height: calc(100vh - 420px);
  background-color: #fff;
  box-shadow: 2px 0 6px rgba(0, 0, 0, 0.1);
  z-index: 1001;
  padding: 20px;
  overflow-y: auto;
  box-sizing: border-box; 
}

.tree-panel {
  height: 100%;
}
</style>

