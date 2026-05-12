import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { useImageStore } from './stores/imageStore'
import './styles/base.css'
import './styles/card-renderers.css'
import './styles/app.css'

const app = createApp(App)
const pinia = createPinia()
app.use(pinia)
app.use(router)
app.mount('#app')

window.addEventListener('beforeunload', () => {
  useImageStore().cleanup()
})
