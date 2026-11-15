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
      <p class="kicker">
        <a class="source" :href="item.sourceUrl" rel="noopener external">{{ item.sourceName }}</a>
        <template v-if="item.category">
          <span class="dot" aria-hidden="true" />
          <span>{{ item.category }}</span>
        </template>
        <span class="dot" aria-hidden="true" />
        <time :datetime="item.publishedAt">{{ formatTime(item.publishedAt) }}</time>
      </p>
      <h2>
        <a :href="item.url" rel="noopener external">{{ item.titleEn }}</a>
      </h2>
      <p class="summary">{{ item.summaryEn }}</p>
      <a class="more" :href="item.url" rel="noopener external">
        Read the original <span aria-hidden="true">→</span>
      </a>
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

/* Stories are separated by space first, with only a faint hairline between them. */
.story {
  padding: 1.75rem 0;
}

.story + .story {
  border-top: 1px solid var(--rule);
}

.story:first-child {
  padding-top: 0;
}

.kicker {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
  margin: 0 0 0.5rem;
  color: var(--muted);
  font-size: 0.75rem;
  font-weight: 500;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.source {
  color: var(--accent);
  font-weight: 650;
  text-decoration: none;
}

.source:hover {
  text-decoration: underline;
}

.dot {
  width: 3px;
  height: 3px;
  border-radius: 50%;
  background: currentColor;
  opacity: 0.6;
}

.story h2 {
  margin: 0 0 0.5rem;
  font-family: var(--font-display);
  font-size: 1.5rem;
  font-weight: 600;
  letter-spacing: -0.01em;
  line-height: 1.2;
  text-wrap: balance;
}

.story h2 a {
  text-decoration: none;
}

.story h2 a:hover {
  color: var(--accent);
}

.summary {
  margin: 0 0 0.75rem;
  text-wrap: pretty;
}

.more {
  color: var(--muted);
  font-size: 0.875rem;
  font-weight: 500;
  text-decoration: none;
}

.more:hover {
  color: var(--accent);
}
</style>
