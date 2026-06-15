<script setup lang="ts">
import { useUIStore } from '@/stores/ui'

const props = defineProps<{
  repos: string[]
}>()

const ui = useUIStore()

function selectRepo(repo: string) {
  ui.selectRepo(repo)
}

function clearRepo() {
  ui.selectRepo(null)
}
</script>

<template>
  <aside class="repo-sidebar">
    <div class="sidebar-header">
      <h3>Repositories</h3>
    </div>

    <nav class="repo-list">
      <button
        :class="['repo-item', { active: !ui.selectedRepo }]"
        @click="clearRepo"
      >
        <span class="repo-icon">🗂️</span>
        <span class="repo-name">Tous les repos</span>
      </button>

      <button
        v-for="repo in repos"
        :key="repo"
        :class="['repo-item', { active: ui.selectedRepo === repo }]"
        @click="selectRepo(repo)"
      >
        <span class="repo-icon">📁</span>
        <span class="repo-name" :title="repo">{{ repo }}</span>
      </button>
    </nav>
  </aside>
</template>

<style scoped>
.repo-sidebar {
  width: 260px;
  min-height: calc(100vh - 64px);
  background: var(--color-bg-elevated);
  border-right: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
}

.sidebar-header {
  padding: 1rem 1.25rem;
  border-bottom: 1px solid var(--color-border);
}

.sidebar-header h3 {
  margin: 0;
  font-size: 0.875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.025em;
  color: var(--color-text-muted);
}

.repo-list {
  display: flex;
  flex-direction: column;
  padding: 0.5rem;
  gap: 0.25rem;
  overflow-y: auto;
}

.repo-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  padding: 0.65rem 0.75rem;
  border: none;
  border-radius: 0.375rem;
  background: transparent;
  color: var(--color-text);
  font-size: 0.875rem;
  text-align: left;
  cursor: pointer;
  transition: background 0.15s;
}

.repo-item:hover {
  background: var(--color-bg-hover);
}

.repo-item.active {
  background: var(--color-primary);
  color: white;
}

.repo-icon {
  flex-shrink: 0;
  font-size: 1rem;
}

.repo-name {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

@media (max-width: 768px) {
  .repo-sidebar {
    width: 100%;
    min-height: auto;
    border-right: none;
    border-bottom: 1px solid var(--color-border);
  }

  .repo-list {
    flex-direction: row;
    flex-wrap: wrap;
  }
}
</style>
