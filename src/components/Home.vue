<template>
  <div class="bars">
    <v-navigation-drawer v-model="drawer" permanent elevation="5" color="#E3ECFB">
      <v-list-item>
        <v-img src="../src/assets/quiz.png" class="mx-auto my-1" height="120" width="120" />
      </v-list-item>

      <v-divider :thickness="2" class="border-opacity-65" color="#e5e7eb"></v-divider>

      <v-list density="compact" nav>
        <v-list-item
          prepend-icon="mdi-view-dashboard-outline"
          to="/home/dash"
          value="dashboard"
          >Dashboard</v-list-item
        >
        <v-list-item
          prepend-icon="mdi-text-long"
          to="/home/subjects"
          value="subjects"
        >
          Subjects
        </v-list-item>
        <v-list-item
          prepend-icon="mdi-human-male-board"
          to="/home/teachers"
          value="teachers"
          >Teachers</v-list-item
        >
        <v-list-item
          prepend-icon="mdi-account-school-outline"
          to="/home/students"
          value="students"
        >
          Students
        </v-list-item>
        <v-list-item
          prepend-icon="mdi-bookshelf"
          to="/home/lessons"
          value="lessons"
        >
          Lessons
        </v-list-item>
        <v-list-item

          prepend-icon="mdi-chart-box-outline"
          to="/home/reports"
          value="reports"
          >Reports</v-list-item
        >
      </v-list>
    </v-navigation-drawer>

    <v-app-bar :elevation="3" color="#E3ECFB" scroll-behavior="fade-image">
      <v-spacer></v-spacer>
      <v-btn @click="openChangePasswordDialog" icon="mdi-lock" color="#0f172a"></v-btn>
      <v-btn @click="logout" icon="mdi-logout" color="#0f172a"></v-btn>
    </v-app-bar>

    <!-- Dialog for changing password -->
    <v-dialog v-model="changePasswordDialog" max-width="500px">
      <v-card color="#ffffff" class="pa-5">
        <v-card-title class="headline" style="text-align: center; color: #0f172a"
          >Hello, Admin</v-card-title
        >
        <v-card-text>
          <v-text-field
            label="Current Password"
            :type="showCurrentPassword ? 'text' : 'password'"
            v-model="old_password"
            variant="outlined"
            color="#5A94F3"
            :append-inner-icon="showCurrentPassword ? 'mdi-eye' : ' mdi-eye-off'"
            @click:append-inner="showCurrentPassword = !showCurrentPassword"
          ></v-text-field>
          <v-text-field
            label="New Password"
            :type="showNewPassword ? 'text' : 'password'"
            v-model="new_password"
            variant="outlined"
            color="#5A94F3"
            :append-inner-icon="showNewPassword ? 'mdi-eye' : ' mdi-eye-off'"
            @click:append-inner="showNewPassword = !showNewPassword"
          ></v-text-field>
        </v-card-text>
        <v-card-actions class="d-flex justify-end">
          <v-btn class="custom-buttonC mx-2" small text @click="changePassword">Confirm</v-btn>
          <v-btn class="custom-button mx-2" small text @click="closeChangePasswordDialog"
            >Cancel</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Snackbar for notifications -->
    <v-snackbar v-model="snackbar" :color="snackbarColor" class="white-text" :timeout="3000" top>
      {{ snackbarMessage }}
    </v-snackbar>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import {getApi} from '@/BaseUrl'
const { url } = getApi()

const drawer = ref(true)
const changePasswordDialog = ref(false)
const old_password = ref('')
const new_password = ref('')
const logoutAfterChange = ref(false)
const showCurrentPassword = ref(false)
const showNewPassword = ref(false)

const snackbar = ref(false)
const snackbarMessage = ref('')
const snackbarColor = ref('#10b981') // Success افتراضي

const loginDialog = ref(false)

const router = useRouter() // إنشاء متغير router

function openChangePasswordDialog() {
  changePasswordDialog.value = true
}

function closeChangePasswordDialog() {
  changePasswordDialog.value = false
  old_password.value = ''
  new_password.value = ''
  logoutAfterChange.value = false
  showCurrentPassword.value = false
  showNewPassword.value = false
}

async function changePassword() {
  try {
    const token = localStorage.getItem('token')
    await axios.post(
      `${url}/change-password`,
      {
        old_password: old_password.value,
        new_password: new_password.value,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      },
    )

    snackbarMessage.value = 'Password changed successfully'
    snackbarColor.value = '#10b981' // Success
    snackbar.value = true

    if (logoutAfterChange.value) {
      await logout()
    }
    closeChangePasswordDialog()
  } catch (error) {
    snackbarMessage.value = 'Failed to change password'
    snackbarColor.value = '#ef4444' // Error
    snackbar.value = true
  }
}

async function logout() {
  try {
    const token = localStorage.getItem('token')
    await axios.get(
      `${url}/logout`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      },
    )
  } catch (error) {
    console.error('Logout failed:', error)
  } finally {
    localStorage.removeItem('token')
    router.push('/')
  }
}

function checkAuth() {
  const token = window.localStorage.getItem('token')
  if (!token) {
    loginDialog.value = true
  }
}



onMounted(() => {
  checkAuth()
})
</script>

<style>
/* Palette:
Primary: #3b82f6
Success: #10b981
Warning: #f59e0b
Error: #ef4444
Text Primary: #0f172a
Text Secondary: #475569
Border: #e5e7eb
Surface / Card: #ffffff
Background: #f8fafc
Muted: #94a3b8
*/

.custom-button {
  background-color: #5A94F3 !important;
  color: #ffffff !important;
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
  background-color: #859dbf !important; /* زر ثانوي كما هو */
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

.v-list-item {
  cursor: pointer;
  /* نصوص القائمة */
  color: #0f172a !important;
}

.sub-item {
  font-size: 0.9rem;
  margin-left: 56px;
  color: #94a3b8 !important; /* Muted */
  transition: transform 0.3s ease-in-out;
}

/* خلفية عامة ونصوص */
body {
  background-color: #f8fafc;
  color: #0f172a;
}

/* تخصيص الحواف/الحدود العامة عند الحاجة */
hr,
.v-divider {
  border-color: #e5e7eb !important;
}
</style>

<script>
export default {
  name: 'Home',
}
</script>
