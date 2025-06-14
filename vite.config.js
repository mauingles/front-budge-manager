import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `
          @import "@/assets/styles/abstracts/_variables.scss";
          @import "@/assets/styles/abstracts/_mixins.scss";
        `
      }
    }
  },
  // PWA Configuration
  build: {
    target: 'es2015',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['vue'],
          firebase: ['firebase/app', 'firebase/auth', 'firebase/firestore'],
          utils: ['./src/composables/useAuth.js', './src/composables/useNotifications.js', './src/composables/usePWA.js']
        }
      }
    }
  },
  // Service Worker handling
  define: {
    __SW_VERSION__: JSON.stringify(new Date().toISOString())
  },
  // PWA optimizations
  optimizeDeps: {
    include: ['vue', 'firebase/app', 'firebase/auth', 'firebase/firestore']
  }
})