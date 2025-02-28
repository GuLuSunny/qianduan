<template>
  <!-- <nav>
    <router-link to="/">Home</router-link> |
    <router-link to="/about">About</router-link> |
    <router-link to="/login">Login</router-link> |
    <router-link to="/map">Map</router-link> |
    <router-link to="/maptile">MapTile</router-link> |
    <router-link to="/dataQuery">dataQuery</router-link>
  </nav> -->
  <router-view />
</template>
<script setup>
import loginview from './views/LoginView'
</script>
<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

nav {
  padding: 30px;
}

nav a {
  font-weight: bold;
  color: #2c3e50;
}

nav a.router-link-exact-active {
  color: #42b983;
}
@font-face {
  font-family: 'PangMenZhengDao';
  src: url('./assets/font/PangMenZhengDao-nhX5wd4I.woff') format('woff'),
}

@font-face {
  font-family: 'PuHuiTi';
  src: url('./assets/font/PuHuiTi-Bt4JbhD9.woff') format('woff'),
}

@font-face {
  font-family: 'YouShe';
  src: url('./assets/font/YouShe-fahbdFno.woff') format('woff'),
}
</style>
