import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { supabase } from '@/supabase'
import type { User } from '@/supabase'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const isAuthenticated = computed(() => !!user.value)

  async function init() {
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (session?.user) {
      user.value = {
        id: session.user.id,
        email: session.user.email,
      }
    }

    supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        user.value = {
          id: session.user.id,
          email: session.user.email,
        }
      } else {
        user.value = null
      }
    })
  }

  async function login(email: string, password: string) {
    loading.value = true
    error.value = null

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) throw signInError

      if (data.user) {
        user.value = {
          id: data.user.id,
          email: data.user.email,
        }
      }

      return true
    } catch (err: any) {
      error.value = err.message || 'Login failed'
      return false
    } finally {
      loading.value = false
    }
  }

  async function logout() {
    await supabase.auth.signOut()
    user.value = null
  }

  return {
    user,
    loading,
    error,
    isAuthenticated,
    init,
    login,
    logout,
  }
})
