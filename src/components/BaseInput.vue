<template>
  <input 
    class="input" 
    :value="modelValue"
    @input="$emit('update:modelValue', $event.target.value)"
  />
</template>

<script setup>
defineProps(['modelValue'])
defineEmits(['update:modelValue'])
</script>

<style scoped>
.input {
  width: 100%;
  padding: 10px 14px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  background: #ffffff;
  transition: all 0.2s ease;
  font-family: inherit;
  color: #1e293b;
}

.input:focus {
  outline: none;
  border-color: #1e293b;
  box-shadow: 0 0 0 3px rgba(30, 41, 59, 0.1);
  transform: translateY(-1px);
}

.input:hover {
  border-color: #cbd5e1;
}

.input::placeholder {
  color: #94a3b8;
}

.input:disabled {
  background: #f8fafc;
  border-color: #e2e8f0;
  cursor: not-allowed;
  color: #94a3b8;
}
</style>