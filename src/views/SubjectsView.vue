<template>
  <v-container fluid class="subjects">
    <h1 class="mb-12" style="color: #3b82f6; text-align: center">Subjects</h1>

    <Subject
      :headers="headers"
      :userData="subjects"
      @subjectEdited="getSubjects"
      @subjectDeleted="getSubjects"
      ref="teacherRef"
    />
    <!-- Button to Add Teacher -->
    <v-dialog v-model="dialog" persistent style="max-width: 500px; margin: auto">
      <template v-slot:activator="{ props }">
        <v-btn v-bind="props" class="button-add" color="#3b82f6" size="60">
          <v-icon color="white" size="30"> mdi-plus-thick </v-icon>
        </v-btn>
      </template>
      <v-card persistent>
        <v-card-title style="color: #3b82f6; text-align: center"> Add Subjects</v-card-title>
        <v-card-text>
          <v-container>
            <v-row>
              <v-col>
                <v-text-field
                  variant="outlined"
                  color="#3b82f6"
                  v-model="newSubject.title"
                  label="Title*"
                  required
                ></v-text-field> </v-col
            ></v-row>
            <v-row>
              <v-col>
                <v-text-field
                  variant="outlined"
                  color="#3b82f6"
                  v-model="newSubject.price"
                  label="Price*"
                  required
                ></v-text-field>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="#EF4444" text @click="dialog = false">Close</v-btn>
          <v-btn color="#3b82f6" text @click="addNewSubject">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Snackbar -->
    <v-snackbar v-model="snackbar" :timeout="3000" color="#3b82f6" class="white-text">
      {{ snackbarMessage }}
    </v-snackbar>
  </v-container>
</template>

<script setup>
import { onMounted, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import Subject from '@/components/Subject.vue'
import {getApi} from '@/BaseUrl'
const { url } = getApi()

const router = useRouter()

// reactive state
const subjects = ref([])
const dialog = ref(false)
const snackbar = ref(false)
const snackbarMessage = ref('')
const newSubject = ref({
  title: '',
  price: '',
})

// table headers
const headers = ref([
  { title: 'Title', key: 'title' },
  { title: 'Price', key: 'price' },
  { title: '', key: 'actions', sortable: false },
])

const getSubjects = async () => {
  try {
    const { data } = await axios.get(`${url}/get/subjects`)
    subjects.value = data.subjects || []
  } catch (error) {
    console.error('Error loading subjects:', error?.response?.data || error)
    showSnackbar('Failed to load subjects')
  }
}

// Snackbar helper
const showSnackbar = (msg) => {
  snackbarMessage.value = msg
  snackbar.value = true
}

// Add new teacher
const addNewSubject = async () => {
  const requiredFields = ['title', 'price']
  const missingFields = requiredFields.filter((f) => !newSubject.value[f])

  if (missingFields.length > 0) {
    showSnackbar('Insufficient information, please complete the required fields.')
    return
  }

  dialog.value = false
  const formData = new FormData()
  formData.append('title', newSubject.value.title)
  formData.append('price', newSubject.value.price)

  try {
    const response = await axios.post(`${url}/add/subjects`, formData, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    })
    if (response?.data) {
      snackbarMessage.value = response.data.message
      snackbar.value = true
      getSubjects()
      showSnackbar('Subject added successfully')
    }
  } catch (error) {
    console.error('Error adding Subject:', error)
    console.error('Request Data:', error.config.data)
    console.error('Response Status:', error.response.status)
    console.error('Validation Errors:', error.response.data.errors)

    snackbarMessage.value = 'Failed to add subject. Please try again.'
    snackbar.value = true
  }
}

onMounted(() => {
  getSubjects()
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
