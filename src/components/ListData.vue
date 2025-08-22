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
  'FID', 
  'PEOPLE', '男', '女', '三岁以P', '四至六P', '七至十P', '十三至P', '十六至P', '十九至P', '二十四P',
  '三十一P', '四十一P', '六十一P', '八十岁P',
  '博士', '研究生', '本科', '大专', '中专', '高中', '初中', '初中以', '义务教', '学龄前',
  '工业', '农业', '服务业', '交通运输', '农业养殖', '建筑业', '其他', '无业', '非劳动',
  'EC2019', 'bld_area', '2020gdp', 'fangjia', 'Landuse', 'LU_text', 'CinC', 'NDVI', 'PM25','avg_daily_','solar_kwh_','Age_Youth','Age_Middle','Age_Senior'
];

const fieldAliasMap = {
  'FID': 'FID',
  'PEOPLE': '总人口',
  '男': '男性人口',
  '女': '女性人口',
  '三岁以P': '三岁以下',
  '四至六P': '四至六岁',
  '七至十P': '七至十二岁',
  '十三至P': '十三至十五岁',
  '十六至P': '十六至十八岁',
  '十九至P': '十九至二十三岁',
  '二十四P': '二十四至三十岁',
  '三十一P': '三十一至四十岁',
  '四十一P': '四十一至六十岁',
  '六十一P': '六十一至八十岁',
  '八十P': '八十岁以上',
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
  'EC2019': '用电量数据（千瓦时）',
  'bld_area': '建筑体积',
  '2020gdp': '2020年GDP（亿元）',
  'fangjia': '平均房价',
  'Landuse': '土地利用类型编码',
  'LU_text': '土地利用类型名称',
  'CinC': '是否为城中村（1=是）',
  'NDVI': '绿视率（NDVI）',
  'PM25': '空气质量（PM2.5）',
  'avg_daily_': '公共交通流量（日均）',
  'solar_kwh_': '屋顶光伏潜力（千瓦时）',
  'Age_Youth':'青少年人口',
  'Age_Middle':'中年人口',
  'Age_Senior':'老年人口'
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

