<script setup lang="ts">
import { computed } from 'vue'
import { Bar } from 'vue-chartjs'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
} from 'chart.js'

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale)

const props = defineProps<{
  data: { date: string; value: number }[]
}>()

const chartData = computed(() => ({
  labels: props.data.map((d) => d.date),
  datasets: [
    {
      label: 'kWh',
      data: props.data.map((d) => d.value),
      backgroundColor: 'rgba(245, 158, 11, 0.6)',
      borderColor: 'rgba(245, 158, 11, 1)',
      borderWidth: 1,
      borderRadius: 4,
    },
  ],
}))

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    title: { display: true, text: 'Énergie par jour (kWh)' },
  },
  scales: {
    y: { beginAtZero: true },
  },
}
</script>

<template>
  <div class="chart-wrapper">
    <Bar :data="chartData" :options="chartOptions" />
  </div>
</template>

<style scoped>
.chart-wrapper {
  height: 280px;
}
</style>
