<template>
  <div class="transaction">
    <div class="transaction-info">
      <h3>{{ description }}</h3>
      <div class="meta">
        <span class="user">{{ user }}</span>
        <span class="date">{{ formatDate(date) }}</span>
        <span v-if="showGroup" class="group">{{ groupName || 'Sin equipo' }}</span>
      </div>
    </div>
    <div class="transaction-actions">
      <div :class="['amount', type]">
        {{ type === 'income' ? '+' : '-' }}${{ amount }}
      </div>
      <div v-if="canEdit" class="admin-buttons">
        <button @click.stop="$emit('edit')" class="edit-btn" title="Editar">
          ✎
        </button>
        <button @click.stop="$emit('delete')" class="delete-btn" title="Eliminar">
          ✕
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
  background: rgba(255, 255, 255, 0.7);
  border: 1px solid rgba(226, 232, 240, 0.6);
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 8px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  transition: all 0.2s ease;
  backdrop-filter: blur(10px);
  position: relative;
}

.transaction:hover {
  background: rgba(255, 255, 255, 0.9);
  border-color: #cbd5e1;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px -2px rgba(0, 0, 0, 0.1);
}

.transaction:last-child {
  margin-bottom: 0;
}

@media (max-width: 768px) {
  .transaction {
    padding: 14px;
  }
  
  .transaction-info h3 {
    font-size: 14px;
  }
  
  .amount {
    font-size: 15px;
  }
  
  .meta {
    gap: 10px;
    font-size: 10px;
  }
}

.transaction-info {
  flex: 1;
  min-width: 0;
}

.transaction-info h3 {
  margin: 0 0 6px 0;
  font-size: 15px;
  color: #1e293b;
  font-weight: 600;
  line-height: 1.3;
}

.meta {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  font-size: 11px;
  color: #64748b;
  font-weight: 500;
}

.user, .date {
  display: inline-block;
}

.group {
  background: rgba(241, 245, 249, 0.8);
  color: #475569;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 10px;
  font-weight: 600;
  display: inline-block;
}



.transaction-actions {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
}

.amount {
  font-size: 16px;
  font-weight: 700;
  font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace;
  line-height: 1;
}

.amount.income {
  color: #059669;
}

.amount.expense {
  color: #dc2626;
}



@media (max-width: 480px) {
  .transaction {
    padding: 12px;
    flex-direction: column;
    gap: 10px;
  }
  
  .transaction-actions {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    width: 100%;
  }
  
  .admin-buttons {
    gap: 6px;
  }
  
  .edit-btn, .delete-btn {
    width: 30px;
    height: 30px;
    font-size: 12px;
  }
}

.admin-buttons {
  display: flex;
  gap: 4px;
}

.edit-btn, .delete-btn {
  width: 26px;
  height: 26px;
  border: 1px solid rgba(226, 232, 240, 0.8);
  background: rgba(255, 255, 255, 0.8);
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  transition: all 0.2s ease;
  color: #64748b;
}

.edit-btn:hover {
  background: rgba(240, 249, 255, 0.9);
  border-color: #3b82f6;
  color: #3b82f6;
  transform: translateY(-1px);
}

.delete-btn:hover {
  background: rgba(254, 242, 242, 0.9);
  border-color: #ef4444;
  color: #ef4444;
  transform: translateY(-1px);
}

</style>