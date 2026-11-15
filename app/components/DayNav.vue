<script setup lang="ts">
defineProps<{
  older: string | null
  newer: string | null
}>()
</script>

<template>
  <nav v-if="older || newer" class="day-nav" aria-label="Other days">
    <NuxtLink v-if="older" class="older" :to="`/day/${older}`">
      <span aria-hidden="true">←</span> {{ formatDay(older) }}
    </NuxtLink>
    <NuxtLink v-if="newer" class="newer" :to="`/day/${newer}`">
      {{ formatDay(newer) }} <span aria-hidden="true">→</span>
    </NuxtLink>
  </nav>
</template>

<style scoped>
.day-nav {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 0.75rem 1.5rem;
  margin-top: 3rem;
  padding-top: 1.25rem;
  border-top: 1px solid var(--rule);
  font-size: 0.875rem;
  font-weight: 500;
}

.day-nav a {
  color: var(--muted);
  text-decoration: none;
}

.day-nav a:hover {
  color: var(--accent);
}

.newer {
  margin-left: auto;
}
</style>
