<template>
  <v-data-table :headers="headers" :items="userData" class="elevation-3" item-key="id">
    <!-- eslint-disable-next-line vue/valid-v-slot -->
    <template v-slot:item.actions="{ item }">
      <v-btn size="small" class="custom-button" @click="deleteItem(item)" color="#ef4444"
        >Delete</v-btn
      >
      <v-btn size="small" class="custom-buttonb" @click="viewDetails(item)" color="#f59e0b"
        >Details</v-btn
      >
    </template>
  </v-data-table>

  <!-- Dialog to Confirm Deletion -->
  <v-dialog v-model="dialogDelete" max-width="700px">
    <v-card>
      <v-card-title>Are you sure you want to delete this teacher?</v-card-title>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="#3b82f6" variant="text" @click="closeDelete">Cancel</v-btn>
        <v-btn color="#ef4444" variant="text" @click="deleteItemConfirm">OK</v-btn>
        <v-spacer></v-spacer>
      </v-card-actions>
    </v-card>
  </v-dialog>
  <!-- Snackbar -->
  <v-snackbar v-model="snackbar" :timeout="3000" color="#3b82f6" class="white-text">
    {{ snackbarMessage }}
  </v-snackbar>
</template>
<script setup>
import { computed, ref, watch, nextTick, toRaw } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import {getApi} from '@/BaseUrl'
const { url } = getApi()

const router = useRouter()
const props = defineProps({
  headers: Array,
  userData: Array,
})

const emit = defineEmits(['teacherAdded', 'teacherDeleted'])

const dialog = ref(false)
const dialogDelete = ref(false)
const deletedIndex = ref(-1)
const defaultItem = ref({
  name: '',
  phone: '',
  email: '',
  password: '',
})
const deletedItem = ref({ ...defaultItem.value })
const snackbar = ref(false)
const snackbarMessage = ref('')

function viewDetails(item) {
  router.push(`teachersInfo/${item.id}`)
}

function deleteItem(item) {
  deletedIndex.value = props.userData.indexOf(item)
  deletedItem.value = { ...item }
  dialogDelete.value = true
}

function close() {
  dialog.value = false
  nextTick(() => {
    deletedItem.value = Object.assign({}, defaultItem.value)
    deletedIndex.value = -1
  })
}

async function deleteItemConfirm() {
  try {
    const id = deletedItem.value.id
    const token = localStorage.getItem('token')
    await axios.delete(`${url}/delete/user/${deletedItem.value.id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
    })

    props.userData.splice(deletedIndex.value, 1)
    dialogDelete.value = false
    showSnackbar('Teacher deleted')
    emit('teacherDeleted')

    closeDelete()
  } catch (error) {
    console.error('Error deleting teacher:', error)
    console.error('Delete error status:', error.response?.status)
    console.error('Delete error data:', error.response?.data)
    showSnackbar('Unauthenticated. Please log in again.')
  }
}

function closeDelete() {
  dialogDelete.value = false
  nextTick(() => {
    deletedItem.value = { ...defaultItem.value }
    deletedIndex.value = -1
  })
}
function showSnackbar(msg) {
  snackbarMessage.value = msg
  snackbar.value = true
}
watch(dialog, (val) => !val && close())
watch(dialogDelete, (val) => !val && closeDelete())
</script>

<style scoped>
.custom-button {
  background-color: #ef4444 !important;
  color: white !important;
  transition: transform 0.2s;
  border-radius: 25px;
  margin: 8px;
}

.custom-button:hover {
  transform: scale(1.05);
}

.custom-button:active {
  transform: scale(0.95);
}
.custom-buttonS {
  background-color: #ddbd2e !important;
  color: white !important;
  transition: transform 0.2s;
  border-radius: 25px;
  margin: 8px;
}

.custom-buttonS:hover {
  transform: scale(1.05);
}

.custom-buttonS:active {
  transform: scale(0.95);
}
.custom-buttonC {
  background-color: #b271a7 !important;
  color: white !important;
  transition: transform 0.2s;
  border-radius: 25px;
  margin: 8px;
}

.custom-buttonC:hover {
  transform: scale(1.05);
}

.custom-buttonC:active {
  transform: scale(0.95);
}

.custom-buttonb {
  background-color: #f59e0b !important;
  color: white !important;
  transition: transform 0.2s;
  border-radius: 25px;
  margin: 8px;
}

.custom-buttonb:hover {
  transform: scale(1.05);
}

.custom-buttonb:active {
  transform: scale(0.95);
}
</style>
