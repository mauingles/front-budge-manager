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

/* Estilo activo para botones secundarios */
.btn-base.btn-secondary:not(.btn-disabled) {
  background: #374151;
  color: white;
  border-color: #374151;
}

.btn-base.btn-secondary:not(.btn-disabled):hover {
  background: #1f2937;
  border-color: #1f2937;
}
</style>