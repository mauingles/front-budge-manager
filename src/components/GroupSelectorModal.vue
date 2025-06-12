<template>
  <div class="group-selector-modal">
    <button @click="showModal = true" class="btn btn-group">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="width: 16px; height: 16px;">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
     {{ selectedGroupName }}
    </button>
    
    <!-- Modal compacto usando BaseModal -->
    <BaseModal :show="showModal" @close="closeModal">
      <div class="modal-content">
        <div class="modal-header">
          <h3>Equipos</h3>
          <p class="modal-subtitle">Selecciona un equipo para filtrar las transacciones</p>
        </div>
        
        <div class="groups-list">
          <div 
            @click="selectGroup(null)" 
            :class="['group-item', { 'selected': !selectedGroup }]"
          >
            <div class="group-icon-container all-groups">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
                <line x1="9" y1="9" x2="9.01" y2="9"/>
                <line x1="15" y1="9" x2="15.01" y2="9"/>
              </svg>
            </div>
            <div class="group-info">
              <span class="group-name">Todas las transacciones</span>
              <span class="group-desc">Sin filtro de equipo</span>
            </div>
            <div v-if="!selectedGroup" class="check-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                <polyline points="20,6 9,17 4,12"/>
              </svg>
            </div>
          </div>
          
          <div 
            v-for="group in availableGroups" 
            :key="group.id"
            @click="selectGroup(group)"
            :class="['group-item', { 'selected': selectedGroup?.id === group.id }]"
          >
            <div class="group-icon-container">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            </div>
            <div class="group-info">
              <span class="group-name">{{ group.name }}</span>
              <span class="group-desc">{{ group.members?.length || 0 }} {{ group.members?.length === 1 ? 'miembro' : 'miembros' }}</span>
            </div>
            <div v-if="selectedGroup?.id === group.id" class="check-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                <polyline points="20,6 9,17 4,12"/>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </BaseModal>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import BaseModal from './BaseModal.vue'

const props = defineProps(['modelValue', 'availableGroups'])
const emit = defineEmits(['update:modelValue'])

const showModal = ref(false)
const selectedGroup = ref(props.modelValue)

const selectedGroupName = computed(() => {
  return 'Equipos'
})

const selectGroup = (group) => {
  selectedGroup.value = group
  emit('update:modelValue', group)
  closeModal()
}

const closeModal = () => {
  showModal.value = false
}
</script>

<style scoped>
.group-selector-modal {
  position: relative;
}

.btn-group {
  border-color: #3b82f6;
  background: #eff6ff;
  color: #3b82f6;
  width: 100%;
}

.btn-group:hover {
  border-color: #2563eb;
  background: #dbeafe;
}

.modal-content {
  max-width: 200px;
  width: auto;
  min-width: 180px;
}

.modal-header {
  text-align: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #e2e8f0;
}

.modal-header h3 {
  margin: 0 0 4px 0;
  font-size: 16px;
  font-weight: 600;
  color: #0f172a;
  letter-spacing: -0.025em;
}

.modal-subtitle {
  margin: 0;
  font-size: 13px;
  color: #64748b;
  font-weight: 400;
  line-height: 1.4;
}

.groups-list {
  max-height: 240px;
  overflow-y: auto;
  padding: 0;
}

.group-item {
  display: flex;
  align-items: center;
  padding: 8px 10px;
  cursor: pointer;
  transition: all 0.2s ease;
  border-radius: 6px;
  margin-bottom: 3px;
  border: 1px solid transparent;
  position: relative;
}

.group-item:hover {
  background: #f8fafc;
  border-color: #e2e8f0;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px -1px rgba(0, 0, 0, 0.1);
}

.group-item.selected {
  background: #eff6ff;
  border-color: #3b82f6;
  box-shadow: 0 2px 8px -2px rgba(59, 130, 246, 0.3);
}

.group-icon-container {
  width: 24px;
  height: 24px;
  border-radius: 4px;
  background: #f1f5f9;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 8px;
  flex-shrink: 0;
  color: #64748b;
}

.group-icon-container.all-groups {
  background: #f0f9ff;
  color: #0ea5e9;
}

.group-icon-container svg {
  width: 12px;
  height: 12px;
}

.group-info {
  display: flex;
  flex-direction: column;
  gap: 1px;
  flex: 1;
  min-width: 0;
}

.group-name {
  font-size: 13px;
  font-weight: 600;
  color: #0f172a;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  line-height: 1.2;
}

.group-desc {
  font-size: 11px;
  color: #64748b;
  font-weight: 500;
  line-height: 1.1;
}

.check-icon {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #3b82f6;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-left: 6px;
}

.check-icon svg {
  width: 8px;
  height: 8px;
}

@media (max-width: 480px) {
  .modal-content {
    max-width: 100%;
  }
  
  .header-icon {
    width: 44px;
    height: 44px;
  }
  
  .header-icon svg {
    width: 22px;
    height: 22px;
  }
  
  .modal-header h3 {
    font-size: 18px;
  }
  
  .modal-subtitle {
    font-size: 13px;
  }
  
  .group-item {
    padding: 16px 12px;
  }
  
  .group-icon-container {
    width: 32px;
    height: 32px;
  }
  
  .group-icon-container svg {
    width: 16px;
    height: 16px;
  }
  
  .group-name {
    font-size: 14px;
  }
  
  .group-desc {
    font-size: 12px;
  }
  
  .check-icon {
    width: 18px;
    height: 18px;
  }
  
  .check-icon svg {
    width: 10px;
    height: 10px;
  }
}
</style>