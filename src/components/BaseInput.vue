<template>
  <input 
    class="input-base" 
    :type="type"
    :placeholder="placeholder"
    :value="modelValue"
    :disabled="disabled"
    @input="$emit('update:modelValue', $event.target.value)"
  />
</template>

<script setup>
defineProps({
  type: {
    type: String,
    default: 'text'
  },
  placeholder: String,
  modelValue: [String, Number],
  disabled: {
    type: Boolean,
    default: false
  }
})

defineEmits(['update:modelValue'])
</script>

<style scoped>
/* No additional styles needed - using design system base class */
</style>