import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from '@/router'
import { useAuthStore } from '@/stores/auth'
import App from '@/App.vue'
import './style.css'

const app = createApp(App)

app.use(createPinia())
app.use(router)

const auth = useAuthStore()
auth.init().then(() => {
  app.mount('#app')
})
