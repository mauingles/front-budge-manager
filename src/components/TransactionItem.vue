<template>
  <div class="transaction">
    <div class="transaction-info">
      <h3>{{ description }}</h3>
      <div class="meta">
        <span class="user">
          <svg class="meta-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
          {{ user }}
        </span>
        <span class="date">
          <svg class="meta-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
            <line x1="16" y1="2" x2="16" y2="6"/>
            <line x1="8" y1="2" x2="8" y2="6"/>
            <line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
          {{ formatDate(date) }}
        </span>
        <span v-if="showGroup" class="group">
          <svg class="meta-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="m22 21-3-3 3-3"/>
          </svg>
          {{ groupName || 'Sin grupo' }}
        </span>
      </div>
    </div>
    <div class="transaction-actions">
      <div :class="['amount', type]">
        {{ type === 'income' ? '+' : '-' }}${{ amount }}
      </div>
      <div v-if="canEdit" class="admin-buttons">
        <button 
          @click.stop="$emit('edit')" 
          class="edit-btn" 
          title="Editar"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
            <path d="m18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
          </svg>
        </button>
        <button 
          @click.stop="$emit('delete')" 
          class="delete-btn" 
          title="Eliminar"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="3,6 5,6 21,6"/>
            <path d="m19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"/>
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps(['description', 'amount', 'type', 'user', 'date', 'canEdit', 'groupName', 'showGroup'])

// Función para formatear la fecha correctamente
const formatDate = (dateString) => {
  // Si la fecha incluye coma y hora, devolverla tal como está
  if (dateString && dateString.includes(',')) {
    return dateString
  }
  // Si es solo año-mes, devolver formato más legible
  if (dateString && dateString.includes('-')) {
    const [year, month] = dateString.split('-')
    return `${month}/${year}`
  }
  // Fallback
  return dateString || 'Sin fecha'
}
defineEmits(['delete', 'edit'])
</script>

<style scoped>
.transaction {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #e2e8f0;
  transition: background-color 0.2s;
}

.transaction:hover {
  background: #f8fafc;
}

.transaction:last-child {
  border-bottom: none;
}

@media (max-width: 640px) {
  .transaction {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
    padding: 16px;
  }
}

.transaction-info h3 {
  margin: 0 0 8px 0;
  font-size: 16px;
  color: #0f172a;
  font-weight: 600;
}

.meta {
  display: flex;
  gap: 16px;
  font-size: 13px;
  color: #64748b;
}

.user, .date, .group {
  display: flex;
  align-items: center;
  gap: 6px;
}

.meta-icon {
  width: 14px;
  height: 14px;
}

@media (max-width: 640px) {
  .meta {
    gap: 12px;
    flex-wrap: wrap;
  }
}

.group {
  background: #f1f5f9;
  color: #475569;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.amount {
  font-size: 18px;
  font-weight: 700;
  font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace;
}

.amount.income {
  color: #059669;
}

.amount.expense {
  color: #dc2626;
}

@media (max-width: 640px) {
  .amount {
    font-size: 20px;
  }
}

.transaction-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

@media (max-width: 640px) {
  .transaction-actions {
    width: 100%;
    justify-content: space-between;
  }
}

.admin-buttons {
  display: flex;
  gap: 8px;
}

.edit-btn, .delete-btn {
  background: none;
  border: 1px solid #e2e8f0;
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  opacity: 0.8;
  transition: all 0.2s;
  min-width: 40px;
  min-height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.edit-btn svg, .delete-btn svg {
  width: 16px;
  height: 16px;
}

.edit-btn:hover {
  opacity: 1;
  background: #f1f5f9;
  border-color: #94a3b8;
  transform: translateY(-1px);
  color: #334155;
}

.delete-btn:hover {
  opacity: 1;
  background: #fef2f2;
  border-color: #fca5a5;
  transform: translateY(-1px);
  color: #dc2626;
}

@media (max-width: 640px) {
  .edit-btn, .delete-btn {
    min-width: 44px;
    min-height: 44px;
  }
}
</style>