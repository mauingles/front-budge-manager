<template>
  <div class="layout">
    <slot></slot>
  </div>
</template>

<style scoped>
.layout {
  width: 100vw;
  min-height: 100vh;
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(20px);
  padding: 40px; 
  margin: 0;
  box-sizing: border-box;
}

@media (max-width: 768px) {
  .layout {
    padding: 20px;
    background: #f8fafc;
    border-radius: 12px;
    margin: 12px;
    min-height: calc(100vh - 24px);
    box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
    border: 1px solid #e2e8f0;
    background: #ffffff;
    backdrop-filter: none;
  }
}

@media (max-width: 480px) {
  .layout {
    padding: 16px;
    margin: 8px;
    border-radius: 8px;
    min-height: calc(100vh - 16px);
  }
}
</style>