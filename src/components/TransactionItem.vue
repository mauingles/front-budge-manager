<template>
  <div class="transaction">
    <div class="transaction-info">
      <h3>{{ description }}</h3>
      <div class="meta">
        <span class="user">{{ user }}</span>
        <span class="date">{{ formatDate(date) }}</span>
        <span v-if="showGroup" class="group">{{ groupName || 'Sin grupo' }}</span>
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
  background: var(--bg-primary);
  border: 1px solid var(--border-primary);
  border-radius: var(--border-radius-lg);
  padding: var(--spacing-lg);
  margin-bottom: var(--spacing-md);
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  transition: var(--transition-base);
  position: relative;
}

.transaction:hover {
  border-color: var(--border-hover);
  box-shadow: var(--shadow-md);
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
  margin: 0 0 var(--spacing-xs) 0;
  font-size: var(--font-size-base);
  color: var(--text-primary);
  font-weight: var(--font-weight-semibold);
  line-height: var(--line-height-tight);
}

.meta {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-md);
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
  font-weight: var(--font-weight-medium);
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
  color: var(--color-success);
}

.amount.expense {
  color: var(--color-danger);
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
  width: 36px;
  height: 36px;
  border: none;
  background: #f8f9fa;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  transition: all 0.2s ease;
  color: #64748b;
}

.edit-btn:hover {
  background: #0070f3;
  color: #ffffff;
}

.delete-btn:hover {
  background: #ee0000;
  color: #ffffff;
}

</style>