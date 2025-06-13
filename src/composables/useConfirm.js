import { ref } from 'vue'

const confirmState = ref({
  show: false,
  title: '',
  message: '',
  confirmText: 'Confirmar',
  cancelText: 'Cancelar',
  type: 'info',
  resolve: null,
  reject: null
})

export function useConfirm() {
  const confirm = (options = {}) => {
    return new Promise((resolve, reject) => {
      confirmState.value = {
        show: true,
        title: options.title || 'Confirmar',
        message: options.message || '¿Estás seguro?',
        confirmText: options.confirmText || 'Confirmar',
        cancelText: options.cancelText || 'Cancelar',
        type: options.type || 'info',
        resolve,
        reject
      }
    })
  }
  
  const handleConfirm = () => {
    if (confirmState.value.resolve) {
      confirmState.value.resolve(true)
    }
    closeConfirm()
  }
  
  const handleCancel = () => {
    if (confirmState.value.resolve) {
      confirmState.value.resolve(false)
    }
    closeConfirm()
  }
  
  const closeConfirm = () => {
    confirmState.value.show = false
    confirmState.value.resolve = null
    confirmState.value.reject = null
  }
  
  return {
    confirmState,
    confirm,
    handleConfirm,
    handleCancel,
    closeConfirm
  }
}