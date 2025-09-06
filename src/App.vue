<template>
  <v-app> <router-view /> </v-app>
</template>

<script></script>
<style>
/* تكبير الخط العام لكل المشروع */
html {
  font-size: 23px; /* الافتراضي 16px */
}

body {
  font-family: 'Roboto', sans-serif;
  color: #0f172a; /* Text Primary */
}
.app-background {
  background-color: #E3ECFB; /* Light Gray Background */
  min-height: 100vh
}
</style>
