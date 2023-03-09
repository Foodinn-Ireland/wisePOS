<script setup lang="ts">
import HelloWorld from './components/HelloWorld.vue'

console.log("[App.vue]", `Hello world from Electron ${process.versions.electron}!`)
</script>

<template>
  <Suspense>
    <HelloWorld msg="Electron + Vite + Vue" />
  </Suspense>
</template>

<style>

</style>
