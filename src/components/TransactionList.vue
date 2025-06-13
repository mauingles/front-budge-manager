<template>
  <div class="list">
    <TransactionItem 
      v-for="transaction in transactions" 
      :key="transaction.id"
      :description="transaction.description"
      :amount="transaction.amount"
      :type="transaction.type"
      :user="transaction.user"
      :date="transaction.createdAt"
      :can-edit="canEditTransaction(transaction)"
      :group-name="getGroupName(transaction.groupId)"
      :show-group="showGroupTags"
      @edit="$emit('edit', transaction)"
      @delete="$emit('delete', transaction.id)"
    />
    <div v-if="!transactions.length" class="empty">
      📝 No hay transacciones todavía
    </div>
  </div>
</template>

<script setup>
import TransactionItem from './TransactionItem.vue'

const props = defineProps(['transactions', 'currentUser', 'hasGroupAccess', 'groups', 'showGroupTags'])
defineEmits(['edit', 'delete'])

const canEditTransaction = (transaction) => {
  if (!props.currentUser) return false
  
  const isAdmin = props.currentUser.role === 'admin'
  const isSuperAdmin = props.currentUser.role === 'superadmin'
  const isOwner = transaction.userId === props.currentUser.id
  const hasGroupPermission = transaction.groupId ? props.hasGroupAccess(transaction.groupId) : false
  
  // Solo puede editar si:
  // 1. Es superadmin (acceso total), O
  // 2. Es admin (acceso total), O
  // 3. Es el dueño de la transacción, O
  // 4. Es una transacción de grupo y tiene acceso al grupo
  return isSuperAdmin || isAdmin || isOwner || (transaction.groupId && hasGroupPermission)
}

const getGroupName = (groupId) => {
  if (!groupId || !props.groups) return null
  const group = props.groups.find(g => g.id === groupId)
  return group ? group.name : 'Grupo desconocido'
}
</script>

<style scoped>
.list {
  max-height: 400px;
  overflow-y: auto;
  overflow-x: hidden;
  padding-right: 8px;
  position: relative;
}

.list::-webkit-scrollbar {
  width: 6px;
}

.list::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 3px;
}

.list::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

.list::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

.empty {
  padding: 40px;
  text-align: center;
  color: #6b7280;
  font-size: 16px;
}

@media (max-width: 768px) {
  .list {
    max-height: 300px;
    padding-right: 4px;
  }
}

@media (max-width: 480px) {
  .list {
    max-height: 250px;
    padding-right: 2px;
  }
  
  .list::-webkit-scrollbar {
    width: 4px;
  }
}
</style>