<script setup lang="ts">
const { data: items, error } = await useFetch('/api/overview')

const timeFormat = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
  timeZone: 'Europe/Madrid',
})

function formatTime(iso: string) {
  return timeFormat.format(new Date(iso))
}
</script>

<template>
  <p v-if="error" class="notice">The overview is unavailable right now. Please try again later.</p>

  <p v-else-if="!items?.length" class="notice">No stories yet. Check back soon.</p>

  <ol v-else class="stories">
    <li v-for="item in items" :key="item.id" class="story">
      <h2>
        <a :href="item.url" rel="noopener external">{{ item.titleEn }}</a>
      </h2>
      <p class="summary">{{ item.summaryEn }}</p>
      <p class="meta">
        <a :href="item.sourceUrl" rel="noopener external">{{ item.sourceName }}</a>
        · <time :datetime="item.publishedAt">{{ formatTime(item.publishedAt) }}</time>
        <template v-if="item.category"> · {{ item.category }}</template>
        · <a :href="item.url" rel="noopener external">Read the original</a>
      </p>
    </li>
  </ol>
</template>

<style scoped>
.notice {
  color: var(--muted);
  text-align: center;
  padding: 2rem 0;
}

.stories {
  list-style: none;
  margin: 0;
  padding: 0;
}

.story {
  padding: 1.25rem 0;
  border-bottom: 1px solid var(--rule);
}

.story h2 {
  margin: 0 0 0.35rem;
  font-size: 1.3rem;
  line-height: 1.25;
}

.story h2 a {
  text-decoration: none;
}

.story h2 a:hover {
  color: var(--accent);
  text-decoration: underline;
}

.summary {
  margin: 0 0 0.5rem;
}

.meta {
  margin: 0;
  color: var(--muted);
  font-size: 0.875rem;
  font-family: system-ui, sans-serif;
}
</style>
