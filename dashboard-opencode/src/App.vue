<script setup lang="ts">
import { computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useMetrics } from '@/composables/useMetrics'
import AppHeader from '@/components/AppHeader.vue'
import RepoSidebar from '@/components/RepoSidebar.vue'

const route = useRoute()
const auth = useAuthStore()
const { repos, fetchRepos } = useMetrics()

const showHeader = computed(() => route.name !== 'login')
const showSidebar = computed(() => auth.isAuthenticated && route.name !== 'login')

async function loadRepos() {
  if (auth.isAuthenticated) {
    await fetchRepos()
  }
}

onMounted(() => {
  loadRepos()
})

watch(() => auth.isAuthenticated, loadRepos)
</script>

<template>
  <div class="app">
    <AppHeader v-if="showHeader" />

    <div class="layout">
      <RepoSidebar v-if="showSidebar" :repos="repos" />

      <main :class="{ 'with-sidebar': showSidebar }">
        <RouterView />
      </main>
    </div>
  </div>
</template>

<style scoped>
.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.layout {
  display: flex;
  flex: 1;
}

main {
  flex: 1;
  min-width: 0;
}

main.with-sidebar {
  padding-left: 0;
}

@media (max-width: 768px) {
  .layout {
    flex-direction: column;
  }
}
</style>
