
<template>
  <div class="month-selector">
    <label>
      <svg class="label-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
        <line x1="16" y1="2" x2="16" y2="6"/>
        <line x1="8" y1="2" x2="8" y2="6"/>
        <line x1="3" y1="10" x2="21" y2="10"/>
      </svg>
      Período:
    </label>
    <select 
      :value="modelValue" 
      @change="$emit('update:modelValue', $event.target.value)"
      class="select"
    >
      <option v-for="month in months" :key="month.value" :value="month.value">
        {{ month.label }}
      </option>
    </select>
  </div>
</template>

<script setup>
defineProps(['modelValue'])
defineEmits(['update:modelValue'])

const months = [
  { value: '2024-01', label: 'Enero 2024' },
  { value: '2024-02', label: 'Febrero 2024' },
  { value: '2024-03', label: 'Marzo 2024' },
  { value: '2024-04', label: 'Abril 2024' },
  { value: '2024-05', label: 'Mayo 2024' },
  { value: '2024-06', label: 'Junio 2024' },
  { value: '2024-07', label: 'Julio 2024' },
  { value: '2024-08', label: 'Agosto 2024' },
  { value: '2024-09', label: 'Septiembre 2024' },
  { value: '2024-10', label: 'Octubre 2024' },
  { value: '2024-11', label: 'Noviembre 2024' },
  { value: '2024-12', label: 'Diciembre 2024' },
  { value: '2025-01', label: 'Enero 2025' },
  { value: '2025-02', label: 'Febrero 2025' },
  { value: '2025-03', label: 'Marzo 2025' }
]
</script>

<style scoped>
.month-selector {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 0;
}

label {
  font-weight: 600;
  color: #1e293b;
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
  letter-spacing: 0.025em;
}

.label-icon {
  width: 18px;
  height: 18px;
}

.select {
  padding: 12px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 16px;
  background: white;
  min-width: 180px;
  font-weight: 500;
  color: #1e293b;
  transition: all 0.2s ease;
}

.select:focus {
  outline: none;
  border-color: #1e293b;
  box-shadow: 0 0 0 3px rgba(30, 41, 59, 0.1);
  transform: translateY(-1px);
}

.select:hover {
  border-color: #cbd5e1;
}

@media (max-width: 768px) {
  .month-selector {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .select {
    width: 100%;
    min-width: auto;
  }
}
</style>