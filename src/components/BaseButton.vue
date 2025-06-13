<template>
  <button 
    class="btn-base btn-secondary" 
    :class="{ 'btn-disabled': disabled }"
    :disabled="disabled"
    @click="$emit('click')"
  >
    <slot />
  </button>
</template>

<script setup>
defineProps({
  disabled: {
    type: Boolean,
    default: false
  }
})

defineEmits(['click'])
</script>

<style scoped>
/* Additional button-specific styles if needed */
.btn-base {
  min-width: 200px;
  margin-inline: auto;
}
</style>