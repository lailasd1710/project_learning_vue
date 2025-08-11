<template>
  <div class="bars">
    <v-navigation-drawer v-model="drawer" permanent elevation="5">
      <v-list-item>
        <v-img src="@/assets/basma1.jpg" class="mx-auto my-1" height="120" width="120" />
      </v-list-item>

      <v-divider :thickness="2" class="border-opacity-65" color="#b174b0"></v-divider>

      <v-list density="compact" nav>
        <v-list-item
          style="color: teal"
          prepend-icon="mdi-view-dashboard-outline"
          to="/home"
          value="home"
          >Dashboard</v-list-item
        >

        <v-list-item
          style="color: teal"
          prepend-icon="mdi-human-male-board"
          to="/home/teachers"
          value="teachers"
          >Teachers</v-list-item
        >
        <v-list-item
          style="color: teal"
          prepend-icon="mdi-account-school-outline"
          to="/home/students"
          value="students"
        >
          Students
        </v-list-item>

        <v-list-item
          style="color: teal"
          prepend-icon="mdi-text-long"
          to="/home/subjects"
          value="subjects"
        >
          Subjects
        </v-list-item>
        <v-list-item
          style="color: teal"
          prepend-icon="mdi-chart-box-outline"
          to="/home/reports"
          value="reports"
          >Reports</v-list-item
        >
      </v-list>
    </v-navigation-drawer>

    <v-app-bar :elevation="3" color="#fff" scroll-behavior="fade-image">
      <v-spacer></v-spacer>
      <v-btn @click="openChangePasswordDialog" icon="mdi-lock" color="#3b82f6"></v-btn>
      <v-btn @click="logout" icon="mdi-logout" color="#3b82f6"></v-btn>
    </v-app-bar>

    <!-- Dialog for changing password -->
    <v-dialog v-model="changePasswordDialog" max-width="500px">
      <v-card color="#fff" class="pa-5">
        <v-card-title class="headline" style="text-align: center">Hello, Admin</v-card-title>
        <v-card-text>
          <v-text-field
            label="Current Password"
            :type="showCurrentPassword ? 'text' : 'password'"
            v-model="old_password"
            variant="outlined"
            color="#3b82f6"
            :append-inner-icon="showCurrentPassword ? 'mdi-eye' : ' mdi-eye-off'"
            @click:append-inner="showCurrentPassword = !showCurrentPassword"
          ></v-text-field>
          <v-text-field
            label="New Password"
            :type="showNewPassword ? 'text' : 'password'"
            v-model="new_password"
            variant="outlined"
            color="#3b82f6"
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
    <v-snackbar v-model="snackbar" color="#b271a7" class="white-text" :timeout="3000" top>
      {{ snackbarMessage }}
    </v-snackbar>
  </div>
</template>
<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const drawer = ref(true)
const changePasswordDialog = ref(false)
const old_password = ref('')
const new_password = ref('')
const logoutAfterChange = ref(false)
const showCurrentPassword = ref(false)
const showNewPassword = ref(false)

const snackbar = ref(false)
const snackbarMessage = ref('')
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
    const response = await axios.post(
      'http://127.0.0.1:8000/api/change-password',
      {
        old_password: old_password.value,
        new_password: new_password.value,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`, // إرسال التوكن في الهيدر
        },
      },
    )

    snackbarMessage.value = 'Password changed successfully'
    snackbar.value = true
    if (logoutAfterChange.value) {
      await logout()
    }
    closeChangePasswordDialog()
  } catch (error) {
    snackbarMessage.value = 'Failed to change password'
    snackbar.value = true
  }
}

async function logout() {
  try {
    const token = localStorage.getItem('token')
    await axios.post(
      'http://127.0.0.1:8000/api/logout',
      {},
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    )
    localStorage.removeItem('token')
    window.location.href = '/login'
  } catch (error) {
    console.error('Logout failed:', error)
  }
}

function checkAuth() {
  const token = window.localStorage.getItem('token')
  if (!token) {
    loginDialog.value = true
  }
}

function redirectToLogin() {
  window.location.href = '/login'
}

onMounted(() => {
  checkAuth()
})
</script>

<style>
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
  background-color: #5a626e !important;
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
}
.sub-item {
  font-size: 0.9rem;
  margin-left: 56px;
  color: #98c242 !important;
  transition: transform 0.3s ease-in-out;
}
</style>

<script>
export default {
  components() {
    name: Home
  },
}
</script>
