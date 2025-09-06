<!-- src/views/Dashboard.vue -->
<template>
  <v-container fluid>
    <!-- Top summary cards row -->
    <v-row class="my-6" dense>
      <!-- Total Users -->
      <v-col cols="12" md="4">
        <v-card
          elevation="3"
          class="pa-6 dashboard-card"
          style="background-color: #E3ECFB;"
        >
          <!-- Card header with icon and title -->
          <div class="d-flex align-center mb-4">
            <v-icon size="28" color="#5A94F3" class="mr-2">
              mdi-account-group
            </v-icon>
            <span class="text-h6" style="color: #5A94F3; font-weight: 600;">
              Total Users
            </span>
          </div>
          <!-- Main metric -->
          <div class="text-h3 font-weight-bold">
            {{ totalUsers - 1 }}
          </div>
        </v-card>
      </v-col>

      <!-- Total Subjects -->
      <v-col cols="12" md="4">
        <v-card
          elevation="3"
          class="pa-6 dashboard-card"
          style="background-color: #E3ECFB;"
        >
          <div class="d-flex align-center mb-4">
            <v-icon size="28" color="#5A94F3" class="mr-2">
              mdi-book-open-page-variant
            </v-icon>
            <span class="text-h6" style="color: #5A94F3; font-weight: 600;">
              Total Subjects
            </span>
          </div>
          <div class="text-h3 font-weight-bold">
            {{ totalSubjects }}
          </div>
        </v-card>
      </v-col>

      <!-- Total Lessons -->
      <v-col cols="12" md="4">
        <v-card
          elevation="3"
          class="pa-6 dashboard-card"
          style="background-color: #E3ECFB;"
        >
          <div class="d-flex align-center mb-4">
            <v-icon size="28" color="#5A94F3" class="mr-2">
              mdi-play-circle-outline
            </v-icon>
            <span class="text-h6" style="color: #5A94F3; font-weight: 600;">
              Total Lessons
            </span>
          </div>
          <div class="text-h3 font-weight-bold">
            {{ lessonsCount }}
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- Charts row -->
    <v-row dense>
      <!-- Users breakdown pie chart -->
      <v-col cols="12" md="6">
        <v-card
          elevation="3"
          class="pa-6 dashboard-card d-flex flex-column"
          style="background-color: #E3ECFB; height: 400px;"
        >
          <div class="d-flex align-center mb-4">
            <v-icon size="28" color="#5A94F3" class="mr-2">
              mdi-chart-pie
            </v-icon>
            <span class="text-h6" style="color: #5A94F3; font-weight: 600;">
              Users Breakdown
            </span>
          </div>
          <div class="flex-grow-1">
            <DashPie :teachers="teachersCount" :students="studentsCount" />
          </div>
        </v-card>
      </v-col>

      <!-- Lessons per Subject pie chart -->
      <v-col cols="12" md="6">
        <v-card
          elevation="3"
          class="pa-6 dashboard-card d-flex flex-column"
          style="background-color: #E3ECFB; height: 400px;"
        >
          <div class="d-flex align-center mb-4">
            <v-icon size="28" color="#5A94F3" class="mr-2">
              mdi-book-check-outline
            </v-icon>
            <span class="text-h6" style="color: #5A94F3; font-weight: 600;">
              Lessons per Subject
            </span>
          </div>
          <div class="flex-grow-1">
            <LessonsChart :subjects="lessonsPerSubject" />
          </div>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import axios from 'axios'
import DashPie from '@/components/DashPie.vue'
import LessonsChart from '@/components/LessonsChart.vue'
import { getApi } from '@/BaseUrl'

const { url } = getApi()

// Reactive state for all dashboard metrics
const totalUsers = ref(0)
const totalSubjects = ref(0)
const lessonsCount = ref(0)
const teachersCount = ref(0)
const studentsCount = ref(0)
const lessonsPerSubject = ref([])

let refreshInterval = null

// Single function to reload all data
const refreshData = async () => {
  try {
    const token = localStorage.getItem('token')
    const headers = { Authorization: `Bearer ${token}` }

    // Parallel fetch for users and subjects
    const [usersRes, subjectsRes] = await Promise.all([
      axios.get(`${url}/get/users`, { headers }),
      axios.get(`${url}/get/subjects`, { headers })
    ])

    // Destructure user arrays
    const { students = [], teachers = [], admins = [] } = usersRes.data
    totalUsers.value = students.length + teachers.length + admins.length
    studentsCount.value = students.length
    teachersCount.value = teachers.length
    totalSubjects.value = (subjectsRes.data.subjects || []).length

    // Fetch total lessons count
    const lessonsRes = await axios.get(`${url}/get/lessons/count`, { headers })
    lessonsCount.value = lessonsRes.data.lessons_count

    // Fetch lessons count per subject
    const lessonsSubjectsRes = await axios.get(
      `${url}/get/subjects/with/count/lessons`,
      { headers }
    )
    lessonsPerSubject.value = lessonsSubjectsRes.data
  } catch (err) {
    console.error('API error:', err)
  }
}

onMounted(() => {
  refreshData()
  // auto-refresh every 60 seconds
  refreshInterval = setInterval(refreshData, 60000)
})

onBeforeUnmount(() => {
  clearInterval(refreshInterval)
})
</script>

<style scoped>
.dashboard-card {
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}
</style>