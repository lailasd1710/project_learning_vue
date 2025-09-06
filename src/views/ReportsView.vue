<template>
  <v-container fluid class="student" color="#E3ECFB">
    <h1 class="mb-12" style="color: #5A94F3; text-align: center">
      Reports
    </h1>

    <v-data-table
      :headers="headers"
      :items="users"
      class="elevation-3"
      item-key="id"
      ref="userRef"
      color="#E3ECFB"
      :items-per-page="5"
    >
      <!-- custom display for role -->
      <template #item.role_id="{ item }">
        {{ item.role_id === 1 ? 'Student' : 'Teacher' }}
      </template>
    </v-data-table>
  </v-container>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import axios from 'axios'
import {getApi} from '@/BaseUrl'
const { url } = getApi()

const users = ref([])

const headers = ref([
  { title: 'ID', value: 'id ' ,sortable: true },
  { title: 'Name', value: 'name' },
  { title: 'Email', value: 'email' },
  { title: 'Phone', value: 'phone' },
  { title: 'Role', value: 'role_id',sortable: true},
])


const fetchUsers = async () => {
  try {
    // اقرأ التوكن من المكان اللي مخزنه فيه (مثلاً localStorage)
    const token = localStorage.getItem('token') 

    // أرسل الطلب مع هيدر Authorization
    const { data } = await axios.get(
      `${url}/get/users`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    )

    // استخرج الطلاب والمعلمين وادمجهم
    const studentList = Array.isArray(data.students) ? data.students : []
    const teacherList = Array.isArray(data.teachers) ? data.teachers : []
    users.value = [...studentList, ...teacherList]

  } catch (error) {
    console.error('Error fetching users with token:', error)
    users.value = []
  }
}

onMounted(() => {
  fetchUsers()
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