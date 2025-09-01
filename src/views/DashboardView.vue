<template>
  <v-container fluid>
    <v-row>
      <!-- مجموع المستخدمين -->
      <v-col cols="10" sm="4">
        <v-card class="pa-4">
          <v-card-title >Total Users </v-card-title>
          <v-card-text class="text-h4">{{ totalUsers }}</v-card-text>
        </v-card>
      </v-col>

      <!-- عدد المواد -->
      <v-col cols="10" sm="4">
        <v-card class="pa-4">
          <v-card-title>Total Subjects </v-card-title>
          <v-card-text class="text-h4">{{ totalSubjects }}</v-card-text>
        </v-card>
      </v-col>
    </v-row><v-row>
      <!-- المخطط الدائري -->
      <v-col cols="12" sm="8" style="height: 250px;">
        <v-card class="pa-4 d-flex align-center justify-center">
          <DashPie :teachers="teachersCount" :students="studentsCount" />
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import axios from 'axios'
import DashPie from '../components/DashPie.vue'

const totalUsers = ref(0)
const totalSubjects = ref(0)
const teachersCount = ref(0)
const studentsCount = ref(0)
let refreshInterval = null

const refreshData = async () => {
  try {
    const token = localStorage.getItem('token')
    const usersRes = await axios.get('http://127.0.0.1:8000/api/get/users', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    const subjectsRes = await axios.get('http://127.0.0.1:8000/api/get/subjects')

// نفكّ الداتا بحسب الصيغة اللي وصلتكِ
const { students = [], teachers = [], admins = [] } = usersRes.data
const subjectsArr = subjectsRes.data.subjects || []

// نحدّث القيم
totalUsers.value    = students.length + teachers.length + admins.length
studentsCount.value = students.length
teachersCount.value = teachers.length
totalSubjects.value = subjectsArr.length
  } catch (err) {
    console.error('API error:', err)
  }
}

onMounted(() => {
  refreshData()
  refreshInterval = setInterval(refreshData, 60000)
})

onBeforeUnmount(() => {
  clearInterval(refreshInterval)
})
</script>