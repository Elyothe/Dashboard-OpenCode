import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import LoginView from '@/views/LoginView.vue'
import OverviewView from '@/views/OverviewView.vue'
import PRDetailView from '@/views/PRDetailView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: LoginView,
      meta: { public: true },
    },
    {
      path: '/',
      name: 'overview',
      component: OverviewView,
    },
    {
      path: '/pr/:number',
      name: 'pr-detail',
      component: PRDetailView,
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/',
    },
  ],
})

router.beforeEach(async (to) => {
  const auth = useAuthStore()

  if (!auth.isAuthenticated && !to.meta.public) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }

  if (auth.isAuthenticated && to.name === 'login') {
    return { name: 'overview' }
  }
})

export default router
