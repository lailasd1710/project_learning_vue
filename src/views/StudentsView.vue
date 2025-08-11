<template>
  <v-container fluid class="student">
    <h1 class="mb-12" style="color: #3b82f6; text-align: center">Students</h1>
    <v-data-table
      :headers="headers"
      :items="students"
      class="elevation-3"
      item-key="id"
      ref="studentRef"
    >
    </v-data-table>
  </v-container>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const router = useRouter()

// reactive state

const students = ref([])

// table headers
const headers = ref([
  { text: '', align: 'center', value: 'select', sortable: false },
  { title: 'Name', key: 'name' },
  { title: 'Phone', key: 'phone' },
  { title: 'email', key: 'email' },
  { title: '', key: 'actions', sortable: false },
])

// Fetch all teachers
const getStudent = async () => {
  const { data } = await axios.get('http://127.0.0.1:8000/api/get/students')
  students.value = data || []
}

onMounted(() => {
  getStudent()
})
</script>

<style>
.button-add {
  bottom: 0.4cm;
  position: fixed !important;
  right: 0.4cm !important;
  border-radius: 50%;
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.7);
}

.custom-button {
  background-color: #3b82f6 !important;
  color: white !important;
  transition: transform 0.2s;
  border-radius: 25px;
}

.custom-button:hover {
  transform: scale(1.05);
}

.custom-button:active {
  transform: scale(0.95);
}

.custom-buttonC {
  background-color: #3b82f6 !important;
  color: white !important;
  transition: transform 0.2s;
  border-radius: 25px;
}

.custom-buttonC:hover {
  transform: scale(1.05);
}

.custom-buttonC:active {
  transform: scale(0.95);
}

.custom-buttonb {
  background-color: #679fc2 !important;
  color: white !important;
  transition: transform 0.2s;
  border-radius: 25px;
  margin: 8px;
}

.send-message-btn {
  margin-top: 20px; /* مسافة صغيرة بين الجدول والزر */
  border-radius: 25px;
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.7);
}
.fixed-below-navbar-left {
  position: fixed !important;
  left: 0.4cm !important;
  border-radius: 50%;
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.7);
}
</style>
