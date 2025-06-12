<template>
  <div class="card">
    <slot></slot>  </div>
</template>

<style scoped>
.card {
  background: #ffffff;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
  border: 1px solid #f1f5f9;
  margin-bottom: 24px;
}

@media (max-width: 768px) {
  .card {
    padding: 20px;
    margin-bottom: 20px;
    border-radius: 10px;
  }
}

@media (max-width: 480px) {
  .card {
    padding: 18px;
    border-radius: 8px;
    margin-bottom: 16px;
    box-shadow: 0 2px 4px 0 rgb(0 0 0 / 0.1);
  }
}
</style>