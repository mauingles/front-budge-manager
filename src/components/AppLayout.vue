<template>
  <div class="layout">
    <div class="content">
      <slot></slot>
    </div>
    
    <!-- Footer Profesional -->
    <footer class="app-footer">
      <div class="footer-content">
        <div class="footer-left">
          <span class="app-name">Budget Manager</span>
          <span class="copyright">© 2025 Todos los derechos reservados</span>
        </div>
        
        <div class="footer-center">
          <button @click="showTerms = true" class="footer-link">Términos de Uso</button>
          <span class="divider">•</span>
          <button @click="showPrivacy = true" class="footer-link">Política de Privacidad</button>
          <span class="divider">•</span>
          <button @click="showContact = true" class="footer-link">Contacto</button>
        </div>
        
        <div class="footer-right">
          <span class="version">v1.0.0</span>
        </div>
      </div>
    </footer>
    
    <!-- Modal de Términos de Uso -->
    <div v-if="showTerms" class="modal-overlay" @click="showTerms = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Términos de Uso</h3>
          <button @click="showTerms = false" class="close-btn">✕</button>
        </div>
        <div class="modal-body">
          <h4>1. Aceptación de los Términos</h4>
          <p>Al utilizar Budget Manager, aceptas estos términos de uso en su totalidad.</p>
          
          <h4>2. Uso de la Aplicación</h4>
          <p>Budget Manager es una herramienta de gestión financiera personal y grupal. Te comprometes a usar la aplicación de manera responsable y legal.</p>
          
          <h4>3. Privacidad de Datos</h4>
          <p>Tus datos financieros son privados. Solo tú y los miembros de tus equipos pueden acceder a la información compartida.</p>
          
          <h4>4. Responsabilidad</h4>
          <p>Eres responsable de mantener la confidencialidad de tu cuenta y de todas las actividades realizadas bajo tu usuario.</p>
          
          <h4>5. Modificaciones</h4>
          <p>Nos reservamos el derecho de modificar estos términos en cualquier momento. Los cambios serán efectivos inmediatamente después de su publicación.</p>
        </div>
      </div>
    </div>
    
    <!-- Modal de Política de Privacidad -->
    <div v-if="showPrivacy" class="modal-overlay" @click="showPrivacy = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Política de Privacidad</h3>
          <button @click="showPrivacy = false" class="close-btn">✕</button>
        </div>
        <div class="modal-body">
          <h4>1. Información que Recopilamos</h4>
          <p>Recopilamos información financiera que ingresas voluntariamente, como transacciones, categorías y datos de equipos.</p>
          
          <h4>2. Cómo Usamos tu Información</h4>
          <p>Utilizamos tus datos exclusivamente para proporcionar los servicios de gestión financiera y mejorar tu experiencia de usuario.</p>
          
          <h4>3. Compartir Información</h4>
          <p>No vendemos, intercambiamos ni transferimos tu información personal a terceros sin tu consentimiento.</p>
          
          <h4>4. Seguridad de Datos</h4>
          <p>Implementamos medidas de seguridad para proteger tu información personal contra acceso no autorizado.</p>
          
          <h4>5. Cookies</h4>
          <p>Utilizamos cookies para mejorar tu experiencia de navegación y recordar tus preferencias.</p>
        </div>
      </div>
    </div>
    
    <!-- Modal de Contacto -->
    <div v-if="showContact" class="modal-overlay" @click="showContact = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Contacto</h3>
          <button @click="showContact = false" class="close-btn">✕</button>
        </div>
        <div class="modal-body">
          <h4>Soporte Técnico</h4>
          <p>¿Tienes alguna pregunta o necesitas ayuda?</p>
          
          <div class="contact-info">
            <div class="contact-item">
              <strong>Email:</strong> support@xxxx.com
            </div>
          </div>
          
          <h4>Sugerencias</h4>
          <p>Valoramos tus comentarios para mejorar Budget Manager. Envíanos tus ideas a feedback@xxxx.com</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const showTerms = ref(false)
const showPrivacy = ref(false) 
const showContact = ref(false)
</script>

<style scoped>
.layout {
  width: 100vw;
  min-height: 100vh;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 50%, #e2e8f0 100%);
  background-attachment: fixed;
  background-size: cover;
  margin: 0;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}

.content {
  flex: 1;
  padding: 40px;
}

/* Footer Profesional */
.app-footer {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-top: 1px solid rgba(226, 232, 240, 0.6);
  padding: 16px 40px;
  margin-top: auto;
}

.footer-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1400px;
  margin: 0 auto;
  gap: 20px;
}

.footer-left {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.app-name {
  font-weight: 700;
  font-size: 14px;
  color: #0f172a;
  letter-spacing: -0.025em;
}

.copyright {
  font-size: 12px;
  color: #64748b;
}

.footer-center {
  display: flex;
  align-items: center;
  gap: 12px;
}

.footer-link {
  background: none;
  border: none;
  color: #64748b;
  font-size: 12px;
  cursor: pointer;
  transition: color 0.2s ease;
  text-decoration: none;
  padding: 4px 0;
}

.footer-link:hover {
  color: #0f172a;
}

.divider {
  color: #cbd5e1;
  font-size: 12px;
}

.footer-right {
  display: flex;
  align-items: center;
}

.version {
  font-size: 12px;
  color: #94a3b8;
  font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace;
}

/* Modales del Footer */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  padding: 20px;
}

.modal-content {
  background: white;
  border-radius: 12px;
  max-width: 600px;
  width: 100%;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 24px 16px;
  border-bottom: 1px solid #e2e8f0;
}

.modal-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #0f172a;
}

.close-btn {
  background: none;
  border: none;
  font-size: 18px;
  color: #64748b;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: #f1f5f9;
  color: #0f172a;
}

.modal-body {
  padding: 24px;
}

.modal-body h4 {
  margin: 20px 0 8px 0;
  font-size: 14px;
  font-weight: 600;
  color: #374151;
}

.modal-body h4:first-child {
  margin-top: 0;
}

.modal-body p {
  margin: 0 0 16px 0;
  font-size: 14px;
  color: #6b7280;
  line-height: 1.5;
}

.modal-body p:last-child {
  margin-bottom: 0;
}

.contact-info {
  background: #f8fafc;
  border-radius: 8px;
  padding: 16px;
  margin: 16px 0;
}

.contact-item {
  margin-bottom: 8px;
  font-size: 14px;
  color: #374151;
}

.contact-item:last-child {
  margin-bottom: 0;
}

.contact-item strong {
  color: #0f172a;
}

@media (max-width: 768px) {
  .layout {
    background: #f8fafc;
    border-radius: 12px;
    margin: 12px;
    min-height: calc(100vh - 24px);
    box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
    border: 1px solid #e2e8f0;
    background: #ffffff;
    backdrop-filter: none;
  }
  
  .content {
    padding: 20px;
  }
  
  .app-footer {
    padding: 12px 20px;
  }
  
  .footer-content {
    flex-direction: column;
    gap: 12px;
    text-align: center;
  }
  
  .footer-center {
    order: -1;
  }
  
  .modal-content {
    max-width: 100%;
    margin: 20px;
    max-height: calc(100vh - 40px);
  }
  
  .modal-header {
    padding: 20px 20px 12px;
  }
  
  .modal-body {
    padding: 20px;
  }
}

@media (max-width: 480px) {
  .layout {
    margin: 8px;
    border-radius: 8px;
    min-height: calc(100vh - 16px);
  }
  
  .content {
    padding: 16px;
  }
  
  .app-footer {
    padding: 10px 16px;
  }
  
  .footer-center {
    flex-direction: column;
    gap: 8px;
  }
  
  .footer-center > :nth-child(odd) {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  
  .divider {
    display: none;
  }
  
  .modal-content {
    margin: 10px;
    border-radius: 8px;
  }
  
  .modal-header {
    padding: 16px 16px 12px;
  }
  
  .modal-header h3 {
    font-size: 16px;
  }
  
  .modal-body {
    padding: 16px;
  }
}
</style>