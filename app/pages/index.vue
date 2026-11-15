<script setup lang="ts">
const { data, error } = await useFetch('/api/overview')
</script>

<template>
  <p v-if="error" class="notice">The overview is unavailable right now. Please try again later.</p>

  <p v-else-if="!data?.days.length" class="notice">No stories yet. Check back soon.</p>

  <template v-else>
    <DayStories v-for="group in data.days" :key="group.day" :day="group.day" :items="group.items" />
    <DayNav :older="data.older" :newer="null" />
  </template>
</template>

<style scoped>
.notice {
  color: var(--muted);
  text-align: center;
  padding: 2rem 0;
}
</style>
