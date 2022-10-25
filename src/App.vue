<template>
  <main class="app-main">
    <router-view></router-view>
  </main>
</template>

<style lang="scss">
* {
  color: #2c3e50;
  margin: 0;
  padding: 0;
}
html, body {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}
#app {
  height: 100%;
  width: 100%;
  .app-main{
    height: 100%;
    width: 100%;
  }
}
</style>
