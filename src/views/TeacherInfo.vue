<template>
  <v-container fluid>
    <v-card class="pa-5 custom-card" elevation="7">
      <p class="custom-titleB">Child Details</p>
      <v-card-text>
        <v-row justify="center">
          <v-col cols="12" sm="6" md="4" class="d-flex justify-center">
            <v-avatar size="200" class="mx-auto">
              <v-img
                :src="imageUrl"
                alt="Child Image"
                v-if="imageUrl"
                class="rounded-circle custom-image"
              ></v-img>
            </v-avatar>
          </v-col>
        </v-row>
        <v-row>
          <v-col
            cols="12"
            sm="6"
            md="4"
            v-for="(value, key) in displayedFields"
            :key="key"
            class="text-center"
          >
            <div class="mb-3">
              <h3 class="custom-title">{{ key }}</h3>
              <p class="custom-text">{{ value }}</p>
            </div>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup>
import { onMounted, ref, computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const child = ref({})
const imageUrl = ref('')

const getChildDetails = async () => {
  const id = route.params.id
  const response = await get(`https://basma.icu/api/users/showChildInfo/${id}`)
  child.value = response.data.data
  imageUrl.value = child.value.image
}

onMounted(() => {
  getChildDetails()
})

// تحديد الحقول التي سيتم عرضها
const displayedFields = computed(() => ({
  Name: child.value.name,
  'Phone Number': child.value.mobile_number,
  'User Name': child.value.user_name,
  Birthdate: child.value.birthdate,
  'Date of Join': child.value.date_of_join,
  'Date of Exit': child.value.date_of_exit || 'لم يتم تحديدها بعد ',
  'Starting Disease': child.value.starting_disease,
  'Healing Date': child.value.healing_date || 'لم يتم تحديدها بعد ',
  'Disease Type': child.value.disease_type,
  Note: child.value.note || 'لا يوجد',
}))
</script>

<style>
.custom-card {
  box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.3);
}
.custom-titleB {
  color: #b271a7;
  text-align: center;
  font-size: 30px;
}
.custom-title {
  color: #b271a7;
  text-align: center;
  font-size: 15px;
  margin: 10px;
  padding: 10px;
}
.custom-text {
  color: rgb(97, 97, 104);
  text-align: center;
  font-size: 20px;
}

.custom-image {
  border: 4px solid #98c242;
  border-radius: 50%;
}
</style>
