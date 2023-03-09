<script setup lang="ts">
import { type CartItem } from './model'

const props = defineProps<{
  item: CartItem
}>()

</script>

<template>
  <div class="card">
    <h3 class="tittle">
      {{ props.item.name }}
    </h3>
    <span class="price">
      {{ props.item.price }}
    </span>
  </div>
</template>

<style scoped>
.card {
  display: inline-block;
  padding: 0.5rem 1rem;
  border-radius: .25rem;
  cursor: pointer;
}

.tittle {
  width: 100%;
  display: inline-block;
}

</style>
