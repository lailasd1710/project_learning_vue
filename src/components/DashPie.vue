<template>
  <div style="width: 100%; height: 100%;">
    <Pie :data="chartData" :options="chartOptions" />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Pie } from 'vue-chartjs'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  CategoryScale,
} from 'chart.js'

ChartJS.register(Title, Tooltip, Legend, ArcElement, CategoryScale)

const props = defineProps({
  teachers: { type: Number, default: 0 },
  students: { type: Number, default: 0 },
})

const chartData = computed(() => ({
  labels: ['Teachers', 'Students'],
  datasets: [
    {
      backgroundColor: ['#3b82f6', '#475569'],
      data: [props.teachers, props.students],
    },
  ],
}))

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom',
    },
  },
}
</script>