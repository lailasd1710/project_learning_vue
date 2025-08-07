<template>
  <v-container fluid class="teacher">
    <h1 class="mb-12" style="color: #3b82f6; text-align: center">Teachers</h1>

    <Student
      :headers="headers"
      :userData="teachers"
      @deleteTeacher="deleteTeacher"
      @teacherAdded="showSnackbar('Teacher added successfully')"
      @teacherDeleted="showSnackbar('Teacher deleted successfully')"
      ref="teacherRef"
    />
    <!-- Button to Add Teacher -->
    <v-dialog v-model="dialog" persistent style="max-width: 750px; margin: auto">
      <template v-slot:activator="{ props }">
        <v-btn v-bind="props" class="button-add" color="#3b82f6" size="60">
          <v-icon color="white" size="30"> mdi-plus-thick </v-icon>
        </v-btn>
      </template>
      <v-card persistent>
        <v-card-title style="color: #3b82f6; text-align: center"> Add Teacher</v-card-title>
        <v-card-text>
          <v-container>
            <v-row>
              <v-col cols="12" sm="6" md="6">
                <v-text-field
                  variant="outlined"
                  color="#3b82f6"
                  v-model="newUser.name"
                  label="Name*"
                  required
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="6" md="6">
                <v-text-field
                  variant="outlined"
                  color="#3b82f6"
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
                  color="#3b82f6"
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
                  color="#3b82f6"
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
          <v-btn color="#3b82f6" text @click="addNewTeacher">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog v-model="showRequestsDialog" max-width="600">
      <v-card>
        <v-card-title class="text-h6" color="#3b82f6">Subjects Request</v-card-title>
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
                color="#3b82f6"
                @click="acceptRequest(request.id)"
                :disabled="request.status === 'accept'"
              >
                Accept
              </v-btn>
              <v-btn
                size="small"
                color="error"
                @click="rejectRequest(request.id)"
                :disabled="request.status === 'reject'"
              >
                Reject
              </v-btn>
            </v-col>
          </v-row>
        </v-card-text>

        <v-card-actions>
          <v-btn text @click="showRequestsDialog = false" color="#3b82f6"> Close </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <div class="fixed-bottom-right">
      <v-btn color="#3b82f6" @click="showRequestsDialog = true"> Subjects Request </v-btn>
    </div>

    <!-- Snackbar -->
    <v-snackbar v-model="snackbar" :timeout="3000" color="#3b82f6" class="white-text">
      {{ snackbarMessage }}
    </v-snackbar>
  </v-container>
</template>

<script setup>
import { onMounted, ref, computed } from 'vue'
import Student from '@/components/Student.vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

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
  { text: '', align: 'center', value: 'select', sortable: false },
  { title: 'Name', key: 'name' },
  { title: 'Phone', key: 'phone' },
  { title: 'email', key: 'email' },
  { title: '', key: 'actions', sortable: false },
])

// Fetch all teachers
const getTeacher = async () => {
  const { data } = await axios.get('http://127.0.0.1:8000/api/get/teachers')
  teachers.value = data || []
}

// Fetch subject requests
const getSubjectRequests = async () => {
  try {
    const token = localStorage.getItem('token')
    const { data } = await axios.get('http://127.0.0.1:8000/api/get/request/join/subject', {
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
    const response = await axios.post('http://127.0.0.1:8000/api/register/teacher', formData, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    })
    if (response?.data) {
      snackbarMessage.value = response.data.message
      snackbar.value = true
      getTeacher()
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

// Select / deselect helpers (omitted for brevity)

// Approve / reject subject requests
// Approve subject request
const acceptRequest = async (id) => {
  try {
    const token = localStorage.getItem('token')
    // نرسل الحالة accepted
    const { data } = await axios.post(
      `http://127.0.0.1:8000/api/response/teacher/join/subject/${id}`,
      { status: 'accept' },
      { headers: { Authorization: `Bearer ${token}` } },
    )
    // نحدّث الحالة محليًا بناء على ردّ السيرفر
    subjectRequests.value = subjectRequests.value.map((req) =>
      req.id === id ? { ...req, status: data.status } : req,
    )
    showSnackbar('تم قبول الطلب')
  } catch (error) {
    console.error('Error accepting request:', error)
    showSnackbar('فشل قبول الطلب')
  }
}

// Reject subject request
const rejectRequest = async (id) => {
  try {
    const token = localStorage.getItem('token')
    // نرسل الحالة rejected
    const { data } = await axios.post(
      `http://127.0.0.1:8000/api/response/teacher/join/subject/${id}`,
      { status: 'reject' },
      { headers: { Authorization: `Bearer ${token}` } },
    )
    subjectRequests.value = subjectRequests.value.map((req) =>
      req.id === id ? { ...req, status: data.status } : req,
    )
    showSnackbar('تم رفض الطلب')
  } catch (error) {
    console.error('Error rejecting request:', error)
    showSnackbar('فشل رفض الطلب')
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
