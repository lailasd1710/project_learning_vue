<!-- src/components/LessonsChart.vue -->
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
  CategoryScale
} from 'chart.js'

// Register Chart.js components
ChartJS.register(Title, Tooltip, Legend, ArcElement, CategoryScale)

// Accept dynamic list of subjects with lessons_count
const props = defineProps({
  subjects: {
    type: Array,
    default: () => []
  }
})

// Soft pastel palette for an ever-changing number of subjects
const pastelPalette = [
  '#067BC2',
  '#D72483',
  '#011627',
  '#6C1D55',
  '#77DD77',
  '#CFCFC4',
  '#FDFD96',
  '#F3F9D2',
  '#AEC6CF',
]

const chartData = computed(() => {
  const labels = props.subjects.map((s) => s.title)
  const data = props.subjects.map((s) => s.lessons_count)
  const backgroundColor = labels.map((_, i) => pastelPalette[i % pastelPalette.length])

  return {
    labels,
    datasets: [
      {
        data,
        backgroundColor
      }
    ]
  }
})

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
     title: {
     display: false    // ← hide the internal title
   },

    legend: {
      position: 'bottom',
      labels: { boxWidth: 12 }
    },
    tooltip: {
      callbacks: {
        label: (ctx) => `${ctx.label}: ${ctx.formattedValue}`
      }
    }
  }
}
</script>