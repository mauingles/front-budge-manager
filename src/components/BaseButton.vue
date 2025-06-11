<template>
  <button class="btn" @click="$emit('click')">
    <slot></slot>  </button>
</template>

<script setup>
defineEmits(['click'])
</script>

<style scoped>
.btn {
  padding: 10px 20px;
  background: #1e293b;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.2s;
  border: 1px solid transparent;
  min-height: 40px;
  letter-spacing: 0.025em;
}

.btn:hover {
  background: #334155;
  transform: translateY(-1px);
  box-shadow: 0 8px 25px -8px rgba(30, 41, 59, 0.5);
}

.btn:active {
  transform: translateY(0);
}

.btn:disabled {
  background: #94a3b8;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

@media (max-width: 768px) {
  .btn {
    width: 100%;
    padding: 10px 20px;
  }
}
</style>