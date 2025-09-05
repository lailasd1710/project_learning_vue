<template>
  <v-container>
    <v-card max-width="500" class="ma-auto pa-5" color="#fff" elevation="8">
      <v-img src="../src/assets/quiz.png" class=" ma-auto pa-5" contain height="270" width="270" />
      <v-card-text style="text-align: center; color: #3b82f6"><h1>Login</h1></v-card-text>
      <v-text-field
        class="my-5"
        color="#3B82F6  "
        variant="outlined"
        v-model="phone"
        label="Phone Number"
        required
      ></v-text-field>
      <v-text-field
        color="#3B82F6  "
        variant="outlined"
        v-model="password"
        name="password"
        label="Password"
        :append-inner-icon="visible ? 'mdi-eye' : ' mdi-eye-off'"
        :type="visible ? 'text' : 'password'"
        @click:append-inner="visible = !visible"
        hint="At least 8 characters"
        counter
      ></v-text-field>
      <v-col class="d-flex justify-center">
        <v-btn class="custom-button" width="50%" @click="login" color="black"> Login </v-btn>
      </v-col>
    </v-card>
    <v-snackbar v-model="snackbar" :color="snackbarColor" timeout="8000" top>
      <span style="color: white">{{ snackbarMessage }}</span>
    </v-snackbar>
  </v-container>
</template>

<script>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import {getApi} from '@/BaseUrl'
const { url } = getApi()

export default {
  name: 'Login',
  setup() {
    const router = useRouter()
    const phone = ref('')
    const password = ref('')
    const visible = ref(false)
    const snackbar = ref(false)
    const snackbarMessage = ref('')
    const snackbarColor = ref('#3b82f6')
    const login = async () => {
      try {
        const response = await axios.post(`${url}/login`, {
          phone: phone.value,
          password: password.value,
        })

        console.log(response)

        if (response.data.token) {
          localStorage.setItem('token', response.data.token)
          snackbarMessage.value = 'Login successful!'
          snackbarColor.value = '#3b82f6' // لون أخضر عند النجاح
          snackbar.value = true
          router.push('/home')
        } else {
          snackbarMessage.value = 'The information is incorrect '
          snackbarColor.value = '#ef4444' // لون أرجواني عند الفشل
          snackbar.value = true
        }
      } catch (error) {
        console.error('Error during login:', error)
        snackbarMessage.value = 'The information is incorrect  '
        snackbarColor.value = '#ef4444' // لون أرجواني عند الفشل
        snackbar.value = true
      }
    }
    return {
      phone,
      password,
      visible,
      snackbar,
      snackbarMessage,
      snackbarColor,
      login,
    }
  },
}
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
</style>
