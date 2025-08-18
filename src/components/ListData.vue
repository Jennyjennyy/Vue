<template>
  <div class="chart-section">
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
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import * as echarts from 'echarts'

// ✅ 接收从 App.vue 传来的点击网格数据
const props = defineProps({
  gridData: {
    type: Object,
    default: () => ({})
  }
})
console.log('ListData 接收到 gridData:', props.gridData)

const chartRef = ref(null)
const chartInstance = ref(null)

const radarData = {
  2021: {
    allocated: [4200, 3000, 20000, 35000, 50000, 18000],
    actual: [5000, 14000, 28000, 26000, 42000, 21000]
  }
}

const getOption = () => ({
  title: {
    text: `雷达图`,
    textStyle: { fontSize: 10 }
  },
  legend: {
    data: ['Allocated Budget', 'Actual Spending'],
    bottom: 0,
    textStyle: { fontSize: 10 }
  },
  radar: {
    radius: 60,
    name: { textStyle: { fontSize: 10 } },
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
      lineStyle: { width: 1 },
      data: [
        {
          value: radarData[2021].allocated,
          name: 'Allocated Budget'
        },
        {
          value: radarData[2021].actual,
          name: 'Actual Spending'
        }
      ]
    }
  ]
})

const columns = [
  { title: '区域', dataIndex: 'region', key: 'region' },
  { title: '数量', dataIndex: 'value', key: 'value' }
]

const fieldList = [
  'FID', 'id', 'left', 'top', 'right', 'bottom', 'row_index', 'col_index', 'adcode', 'name', 'center', 'centroid',
  'childrenNu', 'level', 'acroutes', 'parent', 'inter_area', 'coverage_r',
  '新建文e', '新建文e_1', '新建文e_2', '新建文e_3', '新建文e_4', '新建文e_5', '新建文e_6', '新建文e_7', '新建文e_8', '新建文e_9',
  '新建文e10', '新建文e11', '新建文e12', '新建文e13',
  '_博士_su', '_研究生', '_本科_su', '_大专_su', '_中专_su', '_高中_su', '_初中_su', '_初中以', '_义务教', '_学龄前',
  '_工业_su', '_农业_su', '_服务业', '_交通运', '_农业养', '_建筑业', '_其他_su', '_无业_su', '_非劳动',
  'UrbanData_', 'UrbanDat_1', 'UrbanDat_2', 'UrbanDat_3', 'UrbanDat_4', 'UrbanDat_5', 'UrbanDat_6', 'UrbanDat_7', 'UrbanDat_8'
];

const fieldAliasMap = {
  'FID': 'FID',
  '新建文e': '总人口',
  '新建文e_1': '男性人口',
  '新建文e_2': '女性人口',
  '新建文e_3': '三岁以下',
  '新建文e_4': '四至六岁',
  '新建文e_5': '七至十二岁',
  '新建文e_6': '十三至十五岁',
  '新建文e_7': '十六至十八岁',
  '新建文e_8': '十九至二十三岁',
  '新建文e_9': '二十四至三十岁',
  '新建文e10': '三十一至四十岁',
  '新建文e11': '四十一至六十岁',
  '新建文e12': '六十一至八十岁',
  '新建文e13': '八十岁以上',
  '_博士_su': '博士',
  '_研究生': '研究生',
  '_本科_su': '本科',
  '_大专_su': '大专',
  '_中专_su': '中专',
  '_高中_su': '高中',
  '_初中_su': '初中',
  '_初中以': '初中以下',
  '_义务教': '义务教育',
  '_学龄前': '学龄前',
  '_工业_su': '工业',
  '_农业_su': '农业',
  '_服务业': '服务业',
  '_交通运': '交通运输',
  '_农业养': '农业养殖',
  '_建筑业': '建筑业',
  '_其他_su': '其他',
  '_无业_su': '无业',
  '_非劳动': '非劳动人群',
  'UrbanData_': '用电量数据（千瓦时）',
  'UrbanDat_1': '建筑体积',
  'UrbanDat_2': '2020年GDP（亿元）',
  'UrbanDat_3': '平均房价',
  'UrbanDat_4': '土地利用类型编码',
  'UrbanDat_5': '土地利用类型名称',
  'UrbanDat_6': '是否为城中村（1=是）',
  'UrbanDat_7': '绿视率（NDVI）',
  'UrbanDat_8': '空气质量（PM2.5）'
}

const dataSource = computed(() => {
  if (!props.gridData || Object.keys(props.gridData).length === 0) {
    return [
      {
        key: 1,
        region: '暂无数据',
        value: '-'
      }
    ]
  }

  return fieldList.map((field, index) => ({
    key: index,
    region: fieldAliasMap[field] || field,
    value: props.gridData[field] ?? '-'
  }))
})






onMounted(() => {
  chartInstance.value = echarts.init(chartRef.value)
  chartInstance.value.setOption(getOption())
})
</script>

<style scoped>
.chart-section {
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
  height: auto;
  overflow: hidden;
  justify-content: space-between;
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

