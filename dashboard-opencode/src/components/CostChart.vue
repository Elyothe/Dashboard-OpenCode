<script setup lang="ts">
import { computed } from 'vue'
import { Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
} from 'chart.js'

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale
)

const props = defineProps<{
  data: { date: string; value: number }[]
}>()

const cumulativeData = computed(() => {
  let sum = 0
  return props.data.map((d) => {
    sum += d.value
    return { date: d.date, value: sum }
  })
})

const chartData = computed(() => ({
  labels: cumulativeData.value.map((d) => d.date),
  datasets: [
    {
      label: 'Coût cumulé ($)',
      data: cumulativeData.value.map((d) => d.value),
      borderColor: 'rgba(16, 185, 129, 1)',
      backgroundColor: 'rgba(16, 185, 129, 0.1)',
      fill: true,
      tension: 0.3,
    },
  ],
}))

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    title: { display: true, text: 'Coût cumulé ($)' },
  },
  scales: {
    y: { beginAtZero: true },
  },
}
</script>

<template>
  <div class="chart-wrapper">
    <Line :data="chartData" :options="chartOptions" />
  </div>
</template>

<style scoped>
.chart-wrapper {
  height: 280px;
}
</style>
