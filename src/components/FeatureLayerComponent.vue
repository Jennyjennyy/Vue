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
import MapViewSingleton from '../mapviewSingleton' 

const emit = defineEmits(['grid-clicked'])

const treeData = [
  {
    title: '图层控制',
    key: 'layer',
    children: [
      {
        title: '网格图层',
        key: 'grid-layer'
      },
      {
        title: '国土',
        key: 'land',
        children: [
          {
            title: '土地利用类型专题图',
            key: 'landuse-layer'
          },
          {
            title: '建筑体积专题图',
            key: 'volume-layer'
          },
          {
            title: '城中村专题图',
            key: 'czc-layer'
          }
        ]
      },
      {
        title: '生态',
        key: 'ecology',
        children: [
          {
            title: 'NDVI专题图',
            key: 'ndvi-layer'
          },
          {
            title: 'PM2.5专题图',
            key: 'pm25-layer'
          }
        ]
      },
      {
        title: '交通',
        key: 'transport',
        children: [
          // 如果你之后有“公共交通流量”或“可达性”图层，可以加在这里
        ]
      },
      {
        title: '能源',
        key: 'energy',
        children: [
          {
            title: '用电量专题图',
            key: 'power-layer'
          }
          // 光伏潜力图层可以后续添加
        ]
      },
      {
        title: '经济',
        key: 'economy',
        children: [
          {
            title: '房价专题图',
            key: 'fangjia-layer'
          },
          {
            title: '2020 GDP 专题图',
            key: 'gdp-layer'
          }
        ]
      },
      {
        title: '人口',
        key: 'population',
        children: [
          {
      title: '人口密度专题图',
      key: 'pop-layer'
        },
        {
      title: '少年与青年层专题图',
      key: 'youth-layer'
    },
    {
      title: '中年层专题图',
      key: 'middle-layer'
    },
    {
      title: '老年层专题图',
      key: 'senior-layer'
    }
        ]
      }
    ]
  }
];


const checkedKeys = ref([])
let featureLayer = null
let ndviLayer = null
let legendInstance = null 
let pm25Layer = null;
let pm25LegendInstance = null;
let fangjiaLayer = null;
let fangjiaLegendInstance = null;
let gdpLayer = null;
let gdpLegendInstance = null;
let volumeLayer = null
let volumeLegendInstance = null 
let powerLayer = null
let powerLegendInstance = null
let landuseLayer = null
let landuseLegendInstance = null
let czcLayer = null
let czcLegendInstance = null
let popLayer = null;
let popLegendInstance = null;
let youthLayer = null;
let youthLegendInstance = null;
let middleLayer = null;
let middleLegendInstance = null;
let seniorLayer = null;
let seniorLegendInstance = null;





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
  const ndviLayerExists = view.map.findLayerById('ndvi-layer');

if (checkedKeysValue.includes('ndvi-layer')) {
  // ✅ 图层已存在，直接设置为可见
  if (ndviLayerExists) {
    ndviLayerExists.visible = true;
    console.log('NDVI专题图层已显示');
  } else {
    // ✅ 图层不存在，首次创建并添加
    if (!ndviLayer) {
      const ndviRenderer = {
        type: 'class-breaks',
        field: 'UrbanDat_7',
        legendOptions: {
          title: '绿化率（NDVI）'
        },
        classBreakInfos: [
          {
            minValue: 0.1,
            maxValue: 0.2,
            label: '0.1-0.2',
            symbol: {
              type: 'simple-fill',
              color: '#d9d9d9',
              outline: { width: 0.5, color: '#999' }
            }
          },
          {
            minValue: 0.2,
            maxValue: 0.4,
            label: '0.2-0.4',
            symbol: {
              type: 'simple-fill',
              color: '#c2e699',
              outline: { width: 0.5, color: '#666' }
            }
          },
          {
            minValue: 0.4,
            maxValue: 0.6,
            label: '0.4-0.6',
            symbol: {
              type: 'simple-fill',
              color: '#78c679',
              outline: { width: 0.5, color: '#333' }
            }
          },
          {
            minValue: 0.6,
            maxValue: 0.8,
            label: '0.6-0.8',
            symbol: {
              type: 'simple-fill',
              color: '#31a354',
              outline: { width: 0.5, color: '#333' }
            }
          },
          {
            minValue: 0.8,
            maxValue: 1,
            label: '0.8-1',
            symbol: {
              type: 'simple-fill',
              color: '#006837',
              outline: { width: 0.5, color: '#333' }
            }
          }
        ]
      };

      ndviLayer = new FeatureLayer({
        url: 'https://2d-arcgis-dev.cloud.cityworks.cn/arcgis/rest/services/keti/Mapserver/0',
        id: 'ndvi-layer',
        outFields: ['*'],
        renderer: ndviRenderer,
        visible: true // ✅ 初始可见
      });

      view.map.add(ndviLayer);
      console.log('NDVI专题图层已添加');
    }
    
  }

  // ✅ 图例处理逻辑不变
  if (!legendInstance) {
    legendInstance = new Legend({
      view: view,
      layerInfos: [{
        layer: ndviLayer,
        title: 'NDVI专题图'
      }]
    });
    view.ui.add(legendInstance, 'bottom-left');
    console.log('图例已创建');
  }
} else {
  // ✅ 改为隐藏图层而不是移除
  if (ndviLayerExists) {
    ndviLayerExists.visible = false;
    console.log('NDVI专题图层已隐藏');
  }
  if (legendInstance) {
    view.ui.remove(legendInstance);
    legendInstance.destroy();
    legendInstance = null;
    console.log('图例已移除');
  }
}

  // --- 3. 处理 PM2.5 图层和图例 ---
const pm25LayerExists = view.map.findLayerById('pm25-layer');

if (checkedKeysValue.includes('pm25-layer')) {
  // ✅ 图层已存在，直接设置为可见
  if (pm25LayerExists) {
    pm25LayerExists.visible = true;
    console.log('PM2.5专题图层已显示');
  } else {
    // ✅ 图层不存在，首次创建并添加
    if (!pm25Layer) {
      const pm25Renderer = {
        type: 'class-breaks',
        field: 'UrbanDat_8',
        legendOptions: {
          title: 'PM2.5 浓度分布'
        },
        classBreakInfos: [
          {
            minValue: 0,
            maxValue: 16.5,
            label: '0-16.5',
            symbol: {
              type: 'simple-fill',
              color: '#A8E6CF',
              outline: { width: 0.5, color: '#666' }
            }
          },
          {
            minValue: 16.5,
            maxValue: 18.5,
            label: '16.5-18.5',
            symbol: {
              type: 'simple-fill',
              color: '#81C784',
              outline: { width: 0.5, color: '#666' }
            }
          },
          {
            minValue: 18.5,
            maxValue: 20,
            label: '18.5-20',
            symbol: {
              type: 'simple-fill',
              color: '#4CAF50',
              outline: { width: 0.5, color: '#666' }
            }
          },
          {
            minValue: 20,
            maxValue: 21.5,
            label: '20-21.5',
            symbol: {
              type: 'simple-fill',
              color: '#FFEB3B',
              outline: { width: 0.5, color: '#333' }
            }
          },
          {
            minValue: 21.5,
            maxValue: 50,
            label: '21.5-50',
            symbol: {
              type: 'simple-fill',
              color: '#F44336',
              outline: { width: 0.5, color: '#333' }
            }
          }
        ]
      };

      pm25Layer = new FeatureLayer({
        url: 'https://2d-arcgis-dev.cloud.cityworks.cn/arcgis/rest/services/keti/Mapserver/0',
        id: 'pm25-layer',
        outFields: ['*'],
        renderer: pm25Renderer,
        visible: true // ✅ 初始可见
      });
    }

    view.map.add(pm25Layer);
    console.log('PM2.5专题图层已添加');
  }

  // ✅ 图例处理逻辑不变
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
  // ✅ 改为隐藏图层而不是移除
  if (pm25LayerExists) {
    pm25LayerExists.visible = false;
    console.log('PM2.5专题图层已隐藏');
  }
  if (pm25LegendInstance) {
    view.ui.remove(pm25LegendInstance);
    pm25LegendInstance.destroy();
    pm25LegendInstance = null;
    console.log('PM2.5图例已移除');
  }
}

// --- 4. 处理房价图层和图例 ---
const fangjiaLayerExists = view.map.findLayerById('fangjia-layer');

if (checkedKeysValue.includes('fangjia-layer')) {
  // ✅ 图层已存在，直接设置为可见
  if (fangjiaLayerExists) {
    fangjiaLayerExists.visible = true;
    console.log('房价专题图层已显示');
  } else {
    // ✅ 图层不存在，首次创建并添加
    if (!fangjiaLayer) {
      const fangjiaRenderer = {
        type: 'class-breaks',
        field: 'UrbanDat_3',
        legendOptions: {
          title: '房价分布（元/平方米）'
        },
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
        opacity: 0.75,
        visible: true // ✅ 初始可见
      });
    }

    view.map.add(fangjiaLayer);
    console.log('房价专题图层已添加');
  }

  // ✅ 图例处理逻辑不变
  if (!fangjiaLegendInstance) {
    fangjiaLegendInstance = new Legend({
      view: view,
      layerInfos: [{
        layer: fangjiaLayer,
        title: '房价分布'
      }]
    });
    view.ui.add(fangjiaLegendInstance, 'bottom-left');
    console.log('房价图例已创建');
  }
} else {
  // ✅ 改为隐藏图层而不是移除
  if (fangjiaLayerExists) {
    fangjiaLayerExists.visible = false;
    console.log('房价专题图层已隐藏');
  }

  // ✅ 图例仍然移除（也可改为保留但置灰）
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
  // ✅ 图层已存在，直接设置为可见
  if (gdpLayerExists) {
    gdpLayerExists.visible = true;
    console.log('GDP专题图层已显示');
  } else {
    // ✅ 图层不存在，首次创建并添加
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
        opacity: 0.75,
        visible: true // ✅ 初始可见
      });
    }

    view.map.add(gdpLayer);
    console.log('GDP专题图层已添加');
  }

  // ✅ 图例处理逻辑不变
  if (!gdpLegendInstance) {
    gdpLegendInstance = new Legend({
      view: view,
      layerInfos: [{
        layer: gdpLayer,
        title: '2020 GDP 分布'
      }]
    });
    view.ui.add(gdpLegendInstance, 'bottom-left');
    console.log('GDP图例已创建');
  }
} else {
  // ✅ 改为隐藏图层而不是移除
  if (gdpLayerExists) {
    gdpLayerExists.visible = false;
    console.log('GDP专题图层已隐藏');
  }

  // ✅ 图例仍然移除（也可改为保留但置灰）
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
  // ✅ 图层已存在，直接设置为可见
  if (volumeLayerExists) {
    volumeLayerExists.visible = true;
    console.log('建筑体积专题图层已显示');
  } else {
    // ✅ 图层不存在，首次创建并添加
    if (!volumeLayer) {
      const volumeRenderer = {
        type: 'class-breaks',
        field: 'UrbanDat_1',
        legendOptions: {
          title: '建筑体积分布（m³）'
        },
        classBreakInfos: [
          { minValue: 0, maxValue: 1000, label: '0–1000 m³', symbol: { type: 'simple-fill', color: '#ffffcc', outline: { width: 0.5, color: '#666' } } },
          { minValue: 1000, maxValue: 2000, label: '1000–2000 m³', symbol: { type: 'simple-fill', color: '#ffeb99', outline: { width: 0.5, color: '#666' } } },
          { minValue: 2000, maxValue: 3000, label: '2000–3000 m³', symbol: { type: 'simple-fill', color: '#ffcc66', outline: { width: 0.5, color: '#666' } } },
          { minValue: 3000, maxValue: 4000, label: '3000–4000 m³', symbol: { type: 'simple-fill', color: '#ffb366', outline: { width: 0.5, color: '#666' } } },
          { minValue: 4000, maxValue: 5000, label: '4000–5000 m³', symbol: { type: 'simple-fill', color: '#ff9966', outline: { width: 0.5, color: '#666' } } },
          { minValue: 5000, maxValue: 6000, label: '5000–6000 m³', symbol: { type: 'simple-fill', color: '#cc6699', outline: { width: 0.5, color: '#666' } } },
          { minValue: 6000, maxValue: 7000, label: '6000–7000 m³', symbol: { type: 'simple-fill', color: '#9933cc', outline: { width: 0.5, color: '#666' } } },
          { minValue: 7000, maxValue: 8000, label: '7000–8000 m³', symbol: { type: 'simple-fill', color: '#660099', outline: { width: 0.5, color: '#666' } } },
          { minValue: 8000, maxValue: 8100, label: '8000–8100 m³', symbol: { type: 'simple-fill', color: '#330066', outline: { width: 0.5, color: '#666' } } }
        ]
      };

      volumeLayer = new FeatureLayer({
        url: 'https://2d-arcgis-dev.cloud.cityworks.cn/arcgis/rest/services/keti/Mapserver/0',
        id: 'volume-layer',
        outFields: ['*'],
        renderer: volumeRenderer,
        opacity: 0.75,
        visible: true // ✅ 初始可见
      });
    }

    view.map.add(volumeLayer);
    console.log('建筑体积专题图层已添加');
  }

  // ✅ 图例处理逻辑不变
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
  // ✅ 改为隐藏图层而不是移除
  if (volumeLayerExists) {
    volumeLayerExists.visible = false;
    console.log('建筑体积专题图层已隐藏');
  }

  // ✅ 图例仍然移除（也可改为保留但置灰）
  if (volumeLegendInstance) {
    view.ui.remove(volumeLegendInstance);
    volumeLegendInstance.destroy();
    volumeLegendInstance = null;
    console.log('建筑体积图例已移除');
  }
}


// --- 处理用电量图层和图例 ---
const powerLayerExists = view.map.findLayerById('power-layer');

if (checkedKeysValue.includes('power-layer')) {
  // ✅ 图层已存在，直接设置为可见
  if (powerLayerExists) {
    powerLayerExists.visible = true;
    console.log('用电量专题图层已显示');
  } else {
    // ✅ 图层不存在，首次创建并添加
    if (!powerLayer) {
      const powerRenderer = {
        type: 'class-breaks',
        field: 'UrbanData_',
        legendOptions: {
          title: '用电量（kWh）'
        },
        classBreakInfos: [
          { minValue: 0, maxValue: 4000000, label: '0–4百万 kWh', symbol: { type: 'simple-fill', color: '#ffffcc', outline: { width: 0.5, color: '#666' } } },
          { minValue: 4000000, maxValue: 8000000, label: '4–8百万 kWh', symbol: { type: 'simple-fill', color: '#ffeb99', outline: { width: 0.5, color: '#666' } } },
          { minValue: 8000000, maxValue: 12000000, label: '8–12百万 kWh', symbol: { type: 'simple-fill', color: '#ffcc66', outline: { width: 0.5, color: '#666' } } },
          { minValue: 12000000, maxValue: 16000000, label: '12–16百万 kWh', symbol: { type: 'simple-fill', color: '#ff9966', outline: { width: 0.5, color: '#666' } } },
          { minValue: 16000000, maxValue: 20000000, label: '16–20百万 kWh', symbol: { type: 'simple-fill', color: '#9933cc', outline: { width: 0.5, color: '#666' } } },
          { minValue: 20000000, maxValue: 24100000, label: '20–24百万 kWh', symbol: { type: 'simple-fill', color: '#330066', outline: { width: 0.5, color: '#666' } } }
        ]
      };

      powerLayer = new FeatureLayer({
        url: 'https://2d-arcgis-dev.cloud.cityworks.cn/arcgis/rest/services/keti/Mapserver/0',
        id: 'power-layer',
        outFields: ['*'],
        renderer: powerRenderer,
        opacity: 0.75,
        visible: true // ✅ 初始可见
      });
    }

    view.map.add(powerLayer);
    console.log('用电量专题图层已添加');
  }

  // ✅ 图例处理逻辑不变
  if (!powerLegendInstance) {
    powerLegendInstance = new Legend({
      view: view,
      layerInfos: [{
        layer: powerLayer,
        title: '用电量分布（kWh）'
      }]
    });
    view.ui.add(powerLegendInstance, 'bottom-left');
    console.log('用电量图例已创建');
  }
} else {
  // ✅ 改为隐藏图层而不是移除
  if (powerLayerExists) {
    powerLayerExists.visible = false;
    console.log('用电量专题图层已隐藏');
  }

  // ✅ 图例仍然移除（也可改为保留但置灰）
  if (powerLegendInstance) {
    view.ui.remove(powerLegendInstance);
    powerLegendInstance.destroy();
    powerLegendInstance = null;
    console.log('用电量图例已移除');
  }
}


// --- 处理土地利用类型图层和图例 ---
const landuseLayerExists = view.map.findLayerById('landuse-layer');

if (checkedKeysValue.includes('landuse-layer')) {
  // ✅ 图层已存在，直接设置为可见
  if (landuseLayerExists) {
    landuseLayerExists.visible = true;
    console.log('土地利用类型专题图层已显示');
  } else {
    // ✅ 图层不存在，首次创建并添加
    if (!landuseLayer) {
      const landuseRenderer = {
        type: 'unique-value',
        field: 'UrbanDat_5',
        legendOptions: {
          title: '土地利用类型'
        },
        uniqueValueInfos: [
          { value: '水体', label: '水体', symbol: { type: 'simple-fill', color: '#a6bddb', outline: { width: 0.5, color: '#666' } } },
          { value: '绿地', label: '绿地', symbol: { type: 'simple-fill', color: '#74c476', outline: { width: 0.5, color: '#666' } } },
          { value: '商业', label: '商业', symbol: { type: 'simple-fill', color: '#fd8d3c', outline: { width: 0.5, color: '#666' } } },
          { value: '交通', label: '交通', symbol: { type: 'simple-fill', color: '#fdae6b', outline: { width: 0.5, color: '#666' } } },
          { value: '住宅', label: '住宅', symbol: { type: 'simple-fill', color: '#9e9ac8', outline: { width: 0.5, color: '#666' } } },
          { value: '工业', label: '工业', symbol: { type: 'simple-fill', color: '#d7301f', outline: { width: 0.5, color: '#666' } } },
          { value: '未知', label: '未知', symbol: { type: 'simple-fill', color: '#969696', outline: { width: 0.5, color: '#666' } } },
          { value: '科教', label: '科教', symbol: { type: 'simple-fill', color: '#6baed6', outline: { width: 0.5, color: '#666' } } }
        ]
      };

      landuseLayer = new FeatureLayer({
        url: 'https://2d-arcgis-dev.cloud.cityworks.cn/arcgis/rest/services/keti/Mapserver/0',
        id: 'landuse-layer',
        outFields: ['*'],
        renderer: landuseRenderer,
        opacity: 0.75,
        visible: true // ✅ 初始可见
      });
    }

    view.map.add(landuseLayer);
    console.log('土地利用类型专题图层已添加');
  }

  // ✅ 图例处理逻辑不变
  if (!landuseLegendInstance) {
    landuseLegendInstance = new Legend({
      view: view,
      layerInfos: [{
        layer: landuseLayer,
        title: '土地利用类型'
      }]
    });
    view.ui.add(landuseLegendInstance, 'bottom-left');
    console.log('土地利用图例已创建');
  }
} else {
  // ✅ 改为隐藏图层而不是移除
  if (landuseLayerExists) {
    landuseLayerExists.visible = false;
    console.log('土地利用类型专题图层已隐藏');
  }

  // ✅ 图例仍然移除（也可改为保留但置灰）
  if (landuseLegendInstance) {
    view.ui.remove(landuseLegendInstance);
    landuseLegendInstance.destroy();
    landuseLegendInstance = null;
    console.log('土地利用图例已移除');
  }
}


// --- 处理城中村图层和图例 ---
const czcLayerExists = view.map.findLayerById('czc-layer');

if (checkedKeysValue.includes('czc-layer')) {
  // ✅ 图层已存在，直接设置为可见
  if (czcLayerExists) {
    czcLayerExists.visible = true;
    console.log('城中村专题图层已显示');
  } else {
    // ✅ 图层不存在，首次创建并添加
    if (!czcLayer) {
      const czcRenderer = {
        type: 'unique-value',
        field: 'UrbanDat_6',
        legendOptions: {
          title: '城中村分布'
        },
        uniqueValueInfos: [
          {
            value: 1,
            label: '城中村',
            symbol: {
              type: 'simple-fill',
              color: '#e31a1c',
              outline: { width: 0.5, color: '#333' }
            }
          },
          {
            value: 0,
            label: '非城中村',
            symbol: {
              type: 'simple-fill',
              color: '#f0f0f0',
              outline: { width: 0.5, color: '#999' }
            }
          }
        ]
      };

      czcLayer = new FeatureLayer({
        url: 'https://2d-arcgis-dev.cloud.cityworks.cn/arcgis/rest/services/keti/Mapserver/0',
        id: 'czc-layer',
        outFields: ['*'],
        renderer: czcRenderer,
        opacity: 0.75,
        visible: true,
      });
    }

    view.map.add(czcLayer);
    console.log('城中村专题图层已添加');
  }

  // 图例处理逻辑不变
  if (!czcLegendInstance) {
    czcLegendInstance = new Legend({
      view: view,
      layerInfos: [{
        layer: czcLayer,
        title: '城中村分布'
      }]
    });

    
    view.ui.add(czcLegendInstance, 'bottom-left');
    console.log('城中村图例已创建');
  }
} else {
  // 改为隐藏图层而不是移除
  if (czcLayerExists) {
    czcLayerExists.visible = false;
    console.log('城中村专题图层已隐藏');
  }

  // 图例仍然移除（也可改为保留但置灰）
  if (czcLegendInstance) {
    view.ui.remove(czcLegendInstance);
    czcLegendInstance.destroy();
    czcLegendInstance = null;
    console.log('城中村图例已移除');
  }
}
const popLayerExists = view.map.findLayerById('pop-layer');

if (checkedKeysValue.includes('pop-layer')) {
  if (popLayerExists) {
    popLayerExists.visible = true;
    console.log('人口密度专题图层已显示');
  } else {
    if (!popLayer) {
      const popRenderer = {
        type: 'class-breaks',
        field: '新建文e',
        legendOptions: {
          title: '人口密度'
        },
        classBreakInfos: [
          {
            minValue: 0,
            maxValue: 0,
            label: '0',
            symbol: {
              type: 'simple-fill',
              color: '#deebf7',
              outline: { width: 0.5, color: '#999' }
            }
          },
          {
            minValue: 0,
            maxValue: 100,
            label: '0–100',
            symbol: {
              type: 'simple-fill',
              color: '#9ecae1',
              outline: { width: 0.5, color: '#999' }
            }
          },
          {
            minValue: 100,
            maxValue: 300,
            label: '100–300',
            symbol: {
              type: 'simple-fill',
              color: '#3182bd',
              outline: { width: 0.5, color: '#666' }
            }
          },
          {
            minValue: 300,
            maxValue: 500,
            label: '300–500',
            symbol: {
              type: 'simple-fill',
              color: '#08519c',
              outline: { width: 0.5, color: '#333' }
            }
          },
          {
            minValue: 500,
            maxValue: 10000,
            label: '500–10000',
            symbol: {
              type: 'simple-fill',
              color: '#08306b',
              outline: { width: 0.5, color: '#333' }
            }
          }
        ]
      };

      popLayer = new FeatureLayer({
        url: 'https://2d-arcgis-dev.cloud.cityworks.cn/arcgis/rest/services/keti/Mapserver/0',
        id: 'pop-layer',
        outFields: ['*'],
        renderer: popRenderer,
        opacity: 0.75,
        visible: true
      });
    }

    view.map.add(popLayer);
    console.log('人口密度专题图层已添加');
  }

  if (!popLegendInstance) {
    popLegendInstance = new Legend({
      view: view,
      layerInfos: [{
        layer: popLayer,
        title: '人口密度分布'
      }]
    });
    view.ui.add(popLegendInstance, 'bottom-left');
    console.log('人口密度图例已创建');
  }
} else {
  if (popLayerExists) {
    popLayerExists.visible = false;
    console.log('人口密度专题图层已隐藏');
  }

  if (popLegendInstance) {
    view.ui.remove(popLegendInstance);
    popLegendInstance.destroy();
    popLegendInstance = null;
    console.log('人口密度图例已移除');
  }
}


const youthLayerExists = view.map.findLayerById('youth-layer');

if (checkedKeysValue.includes('youth-layer')) {
  if (youthLayerExists) {
    youthLayerExists.visible = true;
    console.log('少年与青年层专题图层已显示');
  } else {
    if (!youthLayer) {
      const youthRenderer = {
        type: 'class-breaks',
        field: 'Age_Youth',
        legendOptions: {
          title: '少年与青年人口（0–30岁）'
        },
        classBreakInfos: [
          {
            minValue: 0,
            maxValue: 0,
            label: '0',
            symbol: {
              type: 'simple-fill',
              color: '#f7fbff',
              outline: { width: 0.5, color: '#999' }
            }
          },
          {
            minValue: 1,
            maxValue: 500,
            label: '1–500',
            symbol: {
              type: 'simple-fill',
              color: '#deebf7',
              outline: { width: 0.5, color: '#999' }
            }
          },
          {
            minValue: 500,
            maxValue: 1000,
            label: '500–1,000',
            symbol: {
              type: 'simple-fill',
              color: '#9ecae1',
              outline: { width: 0.5, color: '#999' }
            }
          },
          {
            minValue: 1000,
            maxValue: 2000,
            label: '1,000–2,000',
            symbol: {
              type: 'simple-fill',
              color: '#6baed6',
              outline: { width: 0.5, color: '#999' }
            }
          },
          {
            minValue: 2000,
            maxValue: 5000,
            label: '2,000以上',
            symbol: {
              type: 'simple-fill',
              color: '#2171b5',
              outline: { width: 0.5, color: '#666' }
            }
          }
        ]
      };

      youthLayer = new FeatureLayer({
        url: 'https://2d-arcgis-dev.cloud.cityworks.cn/arcgis/rest/services/keti/Mapserver/0',
        id: 'youth-layer',
        outFields: ['*'],
        renderer: youthRenderer,
        visible: true
      });
    }

    view.map.add(youthLayer);
    console.log('少年与青年层专题图层已添加');
  }

  if (!youthLegendInstance) {
    youthLegendInstance = new Legend({
      view: view,
      layerInfos: [{
        layer: youthLayer,
        title: '少年与青年层分布'
      }]
    });
    view.ui.add(youthLegendInstance, 'bottom-left');
    console.log('少年与青年层图例已创建');
  }
} else {
  if (youthLayerExists) {
    youthLayerExists.visible = false;
    console.log('少年与青年层专题图层已隐藏');
  }

  if (youthLegendInstance) {
    view.ui.remove(youthLegendInstance);
    youthLegendInstance.destroy();
    youthLegendInstance = null;
    console.log('少年与青年层图例已移除');
  }
}

const middleLayerExists = view.map.findLayerById('middle-layer');

if (checkedKeysValue.includes('middle-layer')) {
  if (middleLayerExists) {
    middleLayerExists.visible = true;
    console.log('中年层专题图层已显示');
  } else {
    if (!middleLayer) {
      const middleRenderer = {
        type: 'class-breaks',
        field: 'Age_Middle',
        legendOptions: {
          title: '中年人口分布（30–60岁）'
        },
        classBreakInfos: [
    {
      minValue: 0,
      maxValue: 100,
      label: '0–100',
      symbol: {
        type: 'simple-fill',
        color: '#fff5eb',
        outline: { width: 0.5, color: '#999' }
      }
    },
    {
      minValue: 100,
      maxValue: 250,
      label: '100–250',
      symbol: {
        type: 'simple-fill',
        color: '#fee6ce',
        outline: { width: 0.5, color: '#999' }
      }
    },
    {
      minValue: 250,
      maxValue: 400,
      label: '250–400',
      symbol: {
        type: 'simple-fill',
        color: '#fdd0a2',
        outline: { width: 0.5, color: '#999' }
      }
    },
    {
      minValue: 400,
      maxValue: 500,
      label: '400–500',
      symbol: {
        type: 'simple-fill',
        color: '#fdae6b',
        outline: { width: 0.5, color: '#999' }
      }
    },
    {
      minValue: 500,
      maxValue: 2000,
      label: '500–2,000',
      symbol: {
        type: 'simple-fill',
        color: '#e6550d',
        outline: { width: 0.5, color: '#666' }
      }
    }
  ]
};

      middleLayer = new FeatureLayer({
        url: 'https://2d-arcgis-dev.cloud.cityworks.cn/arcgis/rest/services/keti/Mapserver/0',
        id: 'middle-layer',
        outFields: ['*'],
        renderer: middleRenderer,
        opacity: 0.75,
        visible: true
      });
    }

    view.map.add(middleLayer);
    console.log('中年层专题图层已添加');
  }

  if (!middleLegendInstance) {
    middleLegendInstance = new Legend({
      view: view,
      layerInfos: [{
        layer: middleLayer,
        title: '中年层分布'
      }]
    });
    view.ui.add(middleLegendInstance, 'bottom-left');
    console.log('中年层图例已创建');
  }
} else {
  if (middleLayerExists) {
    middleLayerExists.visible = false;
    console.log('中年层专题图层已隐藏');
  }

  if (middleLegendInstance) {
    view.ui.remove(middleLegendInstance);
    middleLegendInstance.destroy();
    middleLegendInstance = null;
    console.log('中年层图例已移除');
  }
}
const seniorLayerExists = view.map.findLayerById('senior-layer');

if (checkedKeysValue.includes('senior-layer')) {
  if (seniorLayerExists) {
    seniorLayerExists.visible = true;
    console.log('老年层专题图层已显示');
  } else {
    if (!seniorLayer) {
      const seniorRenderer = {
        type: 'class-breaks',
        field: 'Age_Senior',
        legendOptions: {
          title: '老年人口分布（60岁以上）'
        },
        classBreakInfos: [
          {
            minValue: 0,
            maxValue: 25,
            label: '0–25',
            symbol: {
              type: 'simple-fill',
              color: '#fef0d9',
              outline: { width: 0.5, color: '#999' }
            }
          },
          {
            minValue: 25,
            maxValue: 50,
            label: '25–50',
            symbol: {
              type: 'simple-fill',
              color: '#fdcc8a',
              outline: { width: 0.5, color: '#999' }
            }
          },
          {
            minValue: 50,
            maxValue: 100,
            label: '50–100',
            symbol: {
              type: 'simple-fill',
              color: '#fc8d59',
              outline: { width: 0.5, color: '#999' }
            }
          },
          {
            minValue: 100,
            maxValue: 125,
            label: '100–125',
            symbol: {
              type: 'simple-fill',
              color: '#e34a33',
              outline: { width: 0.5, color: '#999' }
            }
          },
          {
            minValue: 125,
            maxValue: 150,
            label: '125–150',
            symbol: {
              type: 'simple-fill',
              color: '#b30000',
              outline: { width: 0.5, color: '#999' }
            }
          },
          {
            minValue: 150,
            maxValue: 1000,
            label: '150以上',
            symbol: {
              type: 'simple-fill',
              color: '#7f0000',
              outline: { width: 0.5, color: '#666' }
            }
          }
        ]
      };

      seniorLayer = new FeatureLayer({
        url: 'https://2d-arcgis-dev.cloud.cityworks.cn/arcgis/rest/services/keti/Mapserver/0',
        id: 'senior-layer',
        outFields: ['*'],
        renderer: seniorRenderer,
        visible: true
      });
    }

    view.map.add(seniorLayer);
    console.log('老年层专题图层已添加');
  }

  if (!seniorLegendInstance) {
    seniorLegendInstance = new Legend({
      view: view,
      layerInfos: [{
        layer: seniorLayer,
        title: '老年层分布'
      }]
    });
    view.ui.add(seniorLegendInstance, 'bottom-left');
    console.log('老年层图例已创建');
  }
} else {
  if (seniorLayerExists) {
    seniorLayerExists.visible = false;
    console.log('老年层专题图层已隐藏');
  }

  if (seniorLegendInstance) {
    view.ui.remove(seniorLegendInstance);
    seniorLegendInstance.destroy();
    seniorLegendInstance = null;
    console.log('老年层图例已移除');
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
  height: calc(100vh - 380px);
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

