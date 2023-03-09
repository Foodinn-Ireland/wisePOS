<script setup lang="ts">
import { Reader } from '@stripe/terminal-js';
import { onMounted, reactive, ref} from 'vue';

const props = defineProps<{
  modelValue: Reader[]
}>()

const emits = defineEmits<{
  (e: 'connect', value: Reader): void
  (e: 'disconnect', value: Reader): void
}>()
</script>

<template>
  <h1>Readers</h1>
  <ul>
    <li v-for="r in props.modelValue">
      {{ r.label }}
      <button @click="emits('connect', r)">Connect</button>
      <button @click="emits('disconnect', r)">Disconnect</button>
    </li>
  </ul>
</template>

<style scoped>
</style>
