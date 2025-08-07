<template>
  <div class="home">
    <Home /><v-main> <router-view /></v-main>
  </div>
</template>
<script>
import Home from '../components/Home.vue'
export default {
  components: {
    Home,
  },
}
</script>

<style></style>
