<template>
  <v-container fluid class="teacher">
    <h1 class="mb-12" style="color: #5A94F3; text-align: center">Teachers</h1>

    <Teacher
      :headers="headers"
      :userData="teachers"
      @deleteTeacher="deleteTeacher"
      @teacherAdded="getTeacher"
      @teacherDeleted="getTeacher"
      ref="teacherRef"
    />
    <!-- Button to Add Teacher -->
    <v-dialog v-model="dialog" persistent style="max-width: 750px; margin: auto">
      <template v-slot:activator="{ props }">
        <v-btn v-bind="props" class="fab fab-right" color="#5A94F3" size="60">
          <v-icon color="white" size="30"> mdi-plus-thick </v-icon>
        </v-btn>
      </template>
      <v-card persistent>
        <v-card-title style="color: #5A94F3; text-align: center"> Add Teacher</v-card-title>
        <v-card-text>
          <v-container>
            <v-row>
              <v-col cols="12" sm="6" md="6">
                <v-text-field
                  variant="outlined"
                  color="#5A94F3"
                  v-model="newUser.name"
                  label="Name*"
                  required
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="6" md="6">
                <v-text-field
                  variant="outlined"
                  color="#5A94F3"
                  label="Phone number*"
                  type="phone"
                  v-model="newUser.phone"
                  required
                ></v-text-field>
              </v-col> </v-row
            ><v-row>
              <v-col cols="12" sm="6" md="6">
                <v-text-field
                  variant="outlined"
                  color="#5A94F3"
                  v-model="newUser.password"
                  label="Password*"
                  :append-inner-icon="passwordVisible ? 'mdi-eye' : 'mdi-eye-off'"
                  :type="passwordVisible ? 'text' : 'password'"
                  @click:append-inner="passwordVisible = !passwordVisible"
                  hint="At least 8 characters"
                  required
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="6" md="6">
                <v-text-field
                  variant="outlined"
                  color="#5A94F3"
                  label="Email*"
                  type="email"
                  v-model="newUser.email"
                  required
                ></v-text-field> </v-col
            ></v-row>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="#EF4444" text @click="dialog = false">Close</v-btn>
          <v-btn color="#5A94F3" text @click="addNewTeacher">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog v-model="showRequestsDialog" max-width="600">
      <v-card>
        <v-card-title class="text-h6" color="#5A94F3">Subjects Request</v-card-title>
        <v-divider></v-divider>

        <v-card-text>
          <v-row v-for="request in subjectRequests" :key="request.id" class="mb-3">
            <v-col cols="7">
              <strong>{{ request.teacher.name }}</strong>
              reqest teach
              <strong>{{ request.subject.title }}</strong>
            </v-col>
            <v-col cols="5" class="text-right">
              <v-btn
                size="small"
                color="#5A94F3"
                @click="acceptRequest(request.id)"
                :disabled="request.status === 'accept'"
              >
                Accept
              </v-btn>
              <v-btn
                size="small"
                color="#ef4444"
                @click="rejectRequest(request.id)"
                :disabled="request.status === 'reject'"
              >
                Reject
              </v-btn>
            </v-col>
          </v-row>
        </v-card-text>

        <v-card-actions>
          <v-btn text @click="showRequestsDialog = false" color="#5A94F3"> Close </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <div>
      <v-btn color="#10b981" @click="showRequestsDialog = true" class="fab fab-left" size="60"
        ><v-icon color="white" size="30">mdi-archive-arrow-down-outline</v-icon>
      </v-btn>
    </div>

    <!-- Snackbar -->
    <v-snackbar v-model="snackbar" :timeout="3000" color="#5A94F3" class="white-text">
      {{ snackbarMessage }}
    </v-snackbar>
  </v-container>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import Teacher from '@/components/Teacher.vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import {getApi} from '@/BaseUrl'
const { url } = getApi()



const router = useRouter()

// reactive state
const passwordVisible = ref(false)
const teachers = ref([])
const dialog = ref(false)
const snackbar = ref(false)
const snackbarMessage = ref('')
const showRequestsDialog = ref(false)
const subjectRequests = ref([])
const newUser = ref({
  name: '',
  phone: '',
  password: '',
  email: '',
})

// table headers
const headers = ref([
  { text: '', align: 'center' },
  { title: 'Name', key: 'name' },
  { title: 'Phone', key: 'phone' },
  { title: 'email', key: 'email' },
  {title: 'rate', key:'ratings_count'},
  { title: '', key: 'actions', sortable: false },
])

// Fetch all teachers
const getTeacher = async () => {
  const { data } = await axios.get(`${url}/get/teachers`);
  teachers.value = data || []
}

// Fetch subject requests
const getSubjectRequests = async () => {
  try {
    const token = localStorage.getItem('token')
    const { data } = await axios.get(`${url}/get/request/join/subject`, {
      headers: { Authorization: `Bearer ${token}` },
    })

    // استخرجي المصفوفة من المفتاح الصحيح
    subjectRequests.value = data.pending_requests || []
  } catch (error) {
    console.error('Error loading subject requests:', error.response?.data || error)
    showSnackbar('Unauthorized request. Please login again.')
  }
}

// Snackbar helper
const showSnackbar = (msg) => {
  snackbarMessage.value = msg
  snackbar.value = true
}

// Add new teacher
const addNewTeacher = async () => {
  const requiredFields = ['name', 'phone', 'password', 'email']
  const missingFields = requiredFields.filter((f) => !newUser.value[f])

  if (missingFields.length > 0) {
    showSnackbar('Insufficient information, please complete the required fields.')
    return
  }

  dialog.value = false
  const formData = new FormData()
  formData.append('name', newUser.value.name)
  formData.append('phone', newUser.value.phone)
  formData.append('password', newUser.value.password)
  formData.append('email', newUser.value.email)

  try {
    const response = await axios.post(`${url}/register/teacher`, formData, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    })
    if (response?.data) {
      snackbarMessage.value = response.data.message
      snackbar.value = true
      getTeacher()
      newUser.value = { name: '', phone: '', password: '', email: '' }
      showSnackbar('Teacher added successfully')
    }
  } catch (error) {
    console.error('Error adding Teacher:', error)
    console.error('Request Data:', error.config.data)
    console.error('Response Status:', error.response.status)
    console.error('Validation Errors:', error.response.data.errors)

    snackbarMessage.value = 'Failed to add teacher. Please try again.'
    snackbar.value = true
  }
}

// Approve subject request
const acceptRequest = async (id) => {
  try {
    const token = localStorage.getItem('token')
    // نرسل الحالة accepted
    const { data } = await axios.post(
      `${url}/response/teacher/join/subject/${id}`,
      { status: 'accept' },
      { headers: { Authorization: `Bearer ${token}` } },
    )
    subjectRequests.value = subjectRequests.value.filter((req) => req.id !== id)

    showSnackbar('subject accepted')
  } catch (error) {
    console.error('Error accepting request:', error)
    showSnackbar(' failed to accept')
  }
}

// Reject subject request
const rejectRequest = async (id) => {
  try {
    const token = localStorage.getItem('token')
    // نرسل الحالة rejected
    const { data } = await axios.post(
      `${url}/response/teacher/join/subject/${id}`,
      { status: 'reject' },
      { headers: { Authorization: `Bearer ${token}` } },
    )
    subjectRequests.value = subjectRequests.value.filter((req) => req.id !== id)

    showSnackbar('subject rejected')
  } catch (error) {
    console.error('Error rejecting request:', error)
    showSnackbar('reject failed ')
  }
}

onMounted(() => {
  getTeacher()
  getSubjectRequests()
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
  background-color: #5A94F3 !important;
  color: white !important;
  transition: transform 0.2s;
}

.custom-button:hover {
  transform: scale(1.05);
}

.custom-button:active {
  transform: scale(0.95);
}

.custom-buttonC {
  background-color: #5A94F3 !important;
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
.fab {
  position: fixed !important;
  bottom: 0.4cm;
  width: 60px;
  height: 60px;
  border-radius: 50% !important; /* أهم سطر للتدوير */
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.7);
  z-index: 1000; /* ليتفوّق على المحتوى */
}

.fab-right {
  right: 0.4cm !important;
}
.fab-left {
  right: 2.6cm !important;
}
</style>
