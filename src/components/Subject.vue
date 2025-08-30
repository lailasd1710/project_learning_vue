<template>
  <v-data-table :headers="headers" :items="userData" class="elevation-3" item-key="id">
    <!-- eslint-disable-next-line vue/valid-v-slot -->
    <template v-slot:item.actions="{ item }">
      <v-btn size="small" class="custom-button" @click="deleteItem(item)" color="#3b82f6"
        >Delete</v-btn
      >
      <v-btn size="small" class="custom-buttonb" @click="editSubject(item)" color="#679fc2"
        >Edit</v-btn
      >
    </template>
  </v-data-table>
  <!-- Button to edit Subject -->
  <v-dialog v-model="dialog" persistent style="max-width: 500px; margin: auto">
    <v-card persistent>
      <v-card-title style="color: #3b82f6; text-align: center"> Edit Subjects</v-card-title>
      <v-card-text>
        <v-container>
          <v-row>
            <v-col>
              <v-text-field
                variant="outlined"
                color="#3b82f6"
                v-model="editedItem.title"
                label="Title*"
                required
              ></v-text-field> </v-col
          ></v-row>
          <v-row>
            <v-col>
              <v-text-field
                variant="outlined"
                color="#3b82f6"
                v-model="editedItem.price"
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
        <v-btn color="#3b82f6" text @click="EditSubject">Save</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
  <!-- Dialog to Confirm Deletion -->
  <v-dialog v-model="dialogDelete" max-width="700px">
    <v-card>
      <v-card-title>Are you sure you want to delete this subject?</v-card-title>
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
import { ref, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const router = useRouter()
const props = defineProps({
  headers: { type: Array, required: true },
  userData: { type: Array, required: true },
})

const emit = defineEmits(['subjectAdded', 'subjectDeleted'])
const dialog = ref(false)
const dialogDelete = ref(false)
const deletedIndex = ref(-1)
const editedIndex = ref(-1)
const editedItem = ref({ title: '', price: '' })

const defaultItem = ref({
  title: '',
  price: '',
})
const deletedItem = ref({ ...defaultItem.value })
const snackbar = ref(false)
const snackbarMessage = ref('')

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
    const response = await axios.delete(
      `http://127.0.0.1:8000/api/subjects/${deletedItem.value.id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      },
    )

    // حذف العنصر محلياً من props.userData
    props.userData.splice(deletedIndex.value, 1)

    showSnackbar('Subject deleted')
    emit('subjectDeleted')
    dialogDelete.value = false
    closeDelete()

    if (response) {
      emit('subjectDeleted')
      showSnackbar('Subject deleted ')
    }
    closeDelete()
  } catch (error) {
    console.error('Error deleting subject:', error)
    console.error('Delete error status:', error.response?.status)
    console.error('Delete error data:', error.response?.data)
  }
}

function closeDelete() {
  dialogDelete.value = false
  nextTick(() => {
    deletedItem.value = { ...defaultItem.value }
    deletedIndex.value = -1
  })
}
function editSubject(item) {
  if (!item) return
  editedIndex.value = props.userData.indexOf(item)
  editedItem.value = { ...item }
  dialog.value = true
}

async function EditSubject() {
  try {
    const token = localStorage.getItem('token')
    await axios.post(
      `http://127.0.0.1:8000/api/update/subjects/${editedItem.value.id}`,
      editedItem.value,
      { headers: { Authorization: `Bearer ${token}` } },
    )

    // تحديث الصف محلياً
    if (editedIndex.value > -1) {
      Object.assign(props.userData[editedIndex.value], editedItem.value)
    }

    showSnackbar('Subject updated')
    emit('subjectEdited')
    dialog.value = false
    close()
  } catch (error) {
    console.error('Error updating subject:', error)
    showSnackbar('Failed to update subject')
  }
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
  background-color: #f59e0b !important;
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
