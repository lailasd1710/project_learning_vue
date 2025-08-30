<template>
  <v-container class="reports">
    <v-row style="color: #b271a7" class="d-flex flex-wrap justify-center">
      <h1>Select a time Range</h1>
    </v-row>

    <v-row>
      <v-col>
        <h2 style="color: #50c1eb">Start</h2>
        <VueDatePicker
          v-model="RangeDate.start_date"
          :max="RangeDate.end_date"
          :format="format"
        ></VueDatePicker>
      </v-col>
      <v-col>
        <h2 style="color: #50c1eb">End</h2>
        <VueDatePicker
          v-model="RangeDate.end_date"
          :min="RangeDate.start_date"
          :format="format"
        ></VueDatePicker>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12" class="d-flex flex-wrap justify-space-around">
        <v-btn class="custom-btn" width="20%" elevation="2" @click="validateAndFetchData"
          >Search</v-btn
        >
      </v-col>
    </v-row>

    <v-row v-if="bills.length" class="d-flex flex-wrap justify-center">
      <v-table fixed-header class="data-table my-8 mx-8" width="100%">
        <thead>
          <tr>
            <th class="text-left table-header">Product Name</th>
            <th class="text-left table-header">Sale Date</th>
            <th class="text-left table-header">Representative Name</th>
            <th class="text-left table-header">Price</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in bills" :key="item.id">
            <td>{{ item.product_name }}</td>
            <td>{{ item.sale_date }}</td>
            <td>{{ item.representative_name }}</td>
            <td>{{ item.price }}</td>
          </tr>
        </tbody>
      </v-table>
    </v-row>

    <v-row class="d-flex flex-wrap justify-center">
      <v-card elevation="1" width="30%" class="summary-card mx-6 my-7 py-8">
        <h2 class="summary-text">Total Records: {{ totalRecords }}</h2>
      </v-card>
      <v-card elevation="1" width="30%" class="summary-card mx-6 my-7 py-8">
        <h2 class="summary-text">Total Price: {{ totalPrice }}</h2>
      </v-card>
    </v-row>

    <v-row class="d-flex flex-wrap justify-center">
      <v-snackbar v-model="snackbar" color="red" timeout="3000">
        {{ snackbarMessage }}
      </v-snackbar>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref } from 'vue'

const RangeDate = ref({
  start_date: null,
  end_date: null,
})

const bills = ref([])
const totalRecords = ref(0)
const totalPrice = ref(0)
const snackbar = ref(false)
const snackbarMessage = ref('')

const format = (date) => {
  const day = date.getDate()
  const month = date.getMonth() + 1
  const year = date.getFullYear()
  return `${year}-${month}-${day}`
}

const validateAndFetchData = async () => {
  if (new Date(RangeDate.value.start_date) >= new Date(RangeDate.value.end_date)) {
    snackbarMessage.value = 'Start date must be earlier than end date.'
    snackbar.value = true
    return
  }

  try {
    const response = await get(
      `https://basma.icu/api/buying_orders/order/getSoldProductsBetweenDates?start_date=${format(
        RangeDate.value.start_date,
      )}&end_date=${format(RangeDate.value.end_date)}`,
    )

    bills.value = response.data.data
    totalRecords.value = response.data.total_records
    totalPrice.value = response.data.total_price
  } catch (error) {
    snackbarMessage.value = 'Failed to fetch data.'
    snackbar.value = true
  }
}
</script>

<style>
.custom-btn {
  background-color: #98c242;
  color: white;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
  border-radius: 8px; /* حواف مدورة */
}

.custom-btn:hover {
  transform: scale(1.05); /* تكبير الزر عند التمرير */
  box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.2);
}

.custom-btn:active {
  transform: scale(1.1); /* تكبير الزر عند النقر */
}

.table-header {
  color: #b271a7; /* تعديل لون العناوين */
}

.summary-card {
  background-color: rgba(178, 113, 167, 0.7); /* تعديل لون وشفافية البطاقات */
}

.summary-text {
  color: #fff;
  text-align: center;
}
</style>
