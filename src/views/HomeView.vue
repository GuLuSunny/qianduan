<template>
  <!-- <div class="home">
    <img alt="Vue logo" src="../assets/logo.png" />
    <HelloWorld msg="Welcome to Your Vue.js + TypeScript App" />
  </div> -->
  <div>1234</div>
</template>

<script setup>
import { onMounted, getCurrentInstance } from 'vue'
// import HelloWorld from '@/components/HelloWorld.vue' // @ is an alias to /src
import LoginView from '@/views/LoginView.vue'
import { useRouter } from 'vue-router'
const routers = useRouter()

onMounted(() => {
  const instance = getCurrentInstance()
  if (instance) {
    instance.proxy.$nextTick(() => {
      routers.push('/login')
    })
  }
})
</script>
