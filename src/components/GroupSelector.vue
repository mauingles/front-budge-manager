<template>
  <div class="group-selector">
    <button @click="showDropdown = !showDropdown" class="group-button">
      <span>{{ selectedGroupName }}</span>
      <svg class="chevron-icon" :class="{ 'rotate': showDropdown }" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="6,9 12,15 18,9"/>
      </svg>
    </button>
    
    <div v-if="showDropdown" class="group-dropdown">
      <div 
        @click="selectGroup(null)" 
        :class="['group-option', { 'selected': !selectedGroup }]"
      >
        Todos los grupos
      </div>
      <div 
        v-for="group in availableGroups" 
        :key="group.id"
        @click="selectGroup(group)"
        :class="['group-option', { 'selected': selectedGroup?.id === group.id }]"
      >
        {{ group.name }}
      </div>
    </div>
    
    <!-- Overlay para cerrar al hacer click fuera -->
    <div v-if="showDropdown" @click="showDropdown = false" class="dropdown-overlay"></div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

const props = defineProps(['modelValue', 'availableGroups'])
const emit = defineEmits(['update:modelValue'])

const showDropdown = ref(false)
const selectedGroup = ref(props.modelValue)

const selectedGroupName = computed(() => {
  if (!selectedGroup.value) return 'Todos los grupos'
  return selectedGroup.value.name
})

const selectGroup = (group) => {
  selectedGroup.value = group
  emit('update:modelValue', group)
  showDropdown.value = false
}

// Cerrar dropdown al presionar Escape
const handleEscape = (e) => {
  if (e.key === 'Escape') {
    showDropdown.value = false
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleEscape)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleEscape)
})
</script>

<style scoped>
.group-selector {
  position: relative;
  z-index: 1000001;
}

.group-button {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  max-width: 100%;
  min-width: 0;
  height: 40px;
  box-sizing: border-box;
  font-size: 11px;
  font-weight: 400;
  padding: 10px 8px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: white;
  color: #334155;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  gap: 8px;
}

.group-button:hover {
  border-color: #cbd5e1;
  background: #f8fafc;
  transform: translateY(-1px);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.group-button:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.group-button span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
  min-width: 0;
  text-align: left;
}

.chevron-icon {
  width: 12px;
  height: 12px;
  transition: transform 0.2s ease;
  flex-shrink: 0;
}

.chevron-icon.rotate {
  transform: rotate(180deg);
}

.group-dropdown {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 10px 10px -5px rgb(0 0 0 / 0.04);
  z-index: 1000000;
  animation: slideDown 0.2s ease;
  max-height: 200px;
  overflow-y: auto;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.group-option {
  padding: 12px 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 12px;
  font-weight: 400;
  color: #334155;
  border-bottom: 1px solid #f1f5f9;
}

.group-option:last-child {
  border-bottom: none;
}

.group-option:hover {
  background: #f8fafc;
  color: #1e293b;
}

.group-option.selected {
  background: #eff6ff;
  color: #1d4ed8;
  font-weight: 500;
}

.dropdown-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 999999;
}

@media (max-width: 480px) {
  .group-button {
    font-size: 11px;
    padding: 10px 8px;
    gap: 6px;
  }
  
  .chevron-icon {
    width: 12px;
    height: 12px;
  }
  
  .group-dropdown {
    top: calc(100% + 2px);
    max-height: 180px;
  }
  
  .group-option {
    padding: 14px 16px;
    font-size: 13px;
  }
}
</style>