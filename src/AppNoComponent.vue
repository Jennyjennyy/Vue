<template>
  <div class="app-container">
    <h1 class="page-title">城市不均衡时空数据融合与空间画像分析平台</h1>

    <!-- ArcGIS 地图容器 -->
    <div id="mapView" class="map-view"></div>

    <!-- 雷达图和年份按钮 -->
    <div class="chart-section">
      <!-- 年份按钮 -->
      <div class="year-selector">
        <button
          v-for="year in years"
          :key="year"
          @click="setYear(year)"
          :class="{ active: year === selectedYear }"
        >
          {{ year }}
        </button>
      </div>
      <!-- 表格 -->
      <a-table
        class="table-section"
        :dataSource="dataSource"
        :columns="columns"
        :pagination="false"
      />
      
      <!-- 雷达图 -->
      <div ref="chartRef" class="chart"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import * as echarts from 'echarts'
import { loadModules } from 'esri-loader'

const chartRef = ref(null)
const chartInstance = ref(null)

const years = [2021, 2022, 2023]
const selectedYear = ref(2021)

const radarData = {
  2021: {
    allocated: [4200, 3000, 20000, 35000, 50000, 18000],
    actual: [5000, 14000, 28000, 26000, 42000, 21000]
  },
  2022: {
    allocated: [4500, 3200, 18000, 33000, 49000, 16000],
    actual: [4800, 15000, 29000, 25000, 40000, 20000]
  },
  2023: {
    allocated: [4600, 3100, 19000, 34000, 51000, 17000],
    actual: [4900, 13000, 27000, 27000, 41000, 22000]
  }
}

const getOption = (year) => ({
  title: {
    text: `${year} 年雷达图`,
    textStyle: {
      fontSize: 10 
    }
  },
  legend: {
    data: ['Allocated Budget', 'Actual Spending'],
    bottom: 0,
    textStyle: {
      fontSize: 10 
    }
  },
  radar: {
    radius: 60, 
    name: {
      textStyle: {
        fontSize: 10 
      }
    },
    indicator: [
      { name: 'Sales', max: 6500 },
      { name: 'Administration', max: 16000 },
      { name: 'Information Technology', max: 30000 },
      { name: 'Customer Support', max: 38000 },
      { name: 'Development', max: 52000 },
      { name: 'Marketing', max: 25000 }
    ]
  },
  series: [
    {
      name: 'Budget vs spending',
      type: 'radar',
      symbolSize: 3, 
      lineStyle: {
        width: 1 
      },
      data: [
        {
          value: radarData[year].allocated,
          name: 'Allocated Budget'
        },
        {
          value: radarData[year].actual,
          name: 'Actual Spending'
        }
      ]
    }
  ]
})

const columns = [
  {
    title: '区域',
    dataIndex: 'region',
    key: 'region'
  },
  {
    title: '数量',
    dataIndex: 'value',
    key: 'value'
  }
]

const dataSource = ref(
  Array.from({ length: 10 }, (_, i) => ({
    key: i + 1,
    region: `格子 ${String(i + 1).padStart(3, '0')}`,
    value: Math.floor(Math.random() * 100)
  }))
)

const setYear = (year) => {
  selectedYear.value = year
  // 更新表格数据
  dataSource.value = Array.from({ length: 10 }, (_, i) => ({
    key: i + 1,
    region: `格子 ${String(i + 1).padStart(3, '0')}`,
    value: radarData[year].allocated[i]  // 根据年份数据更新数量
  }))
}

onMounted(async () => {
  // ArcGIS 地图初始化
  const [Map, MapView] = await loadModules([
    'esri/Map',
    'esri/views/MapView'
  ])
  const map = new Map({
    basemap: 'streets-navigation-vector' // 可选 basemap：'topo', 'satellite', 'dark-gray' 等
  })

  const view = new MapView({
    container: "mapView",
    map: map,
    center: [114.0579, 22.5431], // 深圳中心经纬度
    zoom: 11,
    ui: {
      components: [] // 隐藏所有 UI 控件
    }
  })

  // 雷达图初始化
  chartInstance.value = echarts.init(chartRef.value)
  chartInstance.value.setOption(getOption(selectedYear.value))
})

watch(selectedYear, (newYear) => {
  chartInstance.value.setOption(getOption(newYear))
})
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

/* 地图容器 */
.map-view {
  position: absolute;
  top: 80px;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 0;
}

/* 雷达图和按钮容器 */
.chart-section {
  flex:1;
  position: fixed;
  top: 80px; 
  bottom: 20px;
  right: 20px;
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
  padding: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 500;
  height:auto;
  overflow:hidden;
  justify-content: space-between; 
}

.year-selector {
  margin-bottom: 10px;
}

.year-selector button {
  margin: 0 5px;
  padding: 6px 12px;
  font-size: 12px;
  border: 1px solid #aaa;
  background-color: white;
  cursor: pointer;
  border-radius: 4px;
}

.year-selector button.active {
  background-color: #2c3e50;
  color: white;
}

.chart {
  width: 320px;
  height: 300px;
}

.table-section {
  max-height: 350px;
  overflow-y: auto;
  margin-bottom: 10px;
  width: 320px;
  font-size: 12px;
}
</style>

