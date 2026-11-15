<template>
  <div class="page">
    <NuxtRouteAnnouncer />
    <header class="masthead">
      <div class="brand">
        <img class="logo" src="/logo.png" alt="" width="64" height="64" />
        <div>
          <h1>The Daily Paella</h1>
          <p>All the news that’s fit to simmer.</p>
        </div>
      </div>
    </header>

    <main>
      <NuxtPage />
    </main>

    <footer class="footer">
      <p>
        Summaries on this site are written by a machine, not a journalist, and may contain errors.
        For the full story, always read the original article.
      </p>
    </footer>
  </div>
</template>

<style>
:root {
  --bg: #faf8f4;
  --text: #1c1917;
  --muted: #78716c;
  --accent: #c2410c;
  --saffron: #f5b301;
  --rule: #e7e2d9;
  --font-display: 'Fraunces Variable', Georgia, serif;
  --font-body: 'Inter Variable', system-ui, sans-serif;
  color-scheme: light dark;
}

@media (prefers-color-scheme: dark) {
  :root {
    --bg: #14120f;
    --text: #f1ede6;
    --muted: #a8a095;
    --accent: #fb923c;
    --rule: #2b2722;
  }
}

body {
  margin: 0;
  background: var(--bg);
  color: var(--text);
  font-family: var(--font-body);
  font-size: 1rem;
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
}

a {
  color: inherit;
}

.page {
  max-width: 40rem;
  margin: 0 auto;
  padding: 3rem 1.25rem 4rem;
}

.masthead {
  margin-bottom: 2.5rem;
}

.brand {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
}

.logo {
  flex: none;
}

.masthead h1 {
  margin: 0;
  font-family: var(--font-display);
  font-size: clamp(1.6rem, 6vw, 2.5rem);
  font-weight: 650;
  letter-spacing: -0.02em;
  line-height: 1.1;
}

.masthead p {
  margin: 0.25rem 0 0;
  color: var(--muted);
}

/* Saffron rule under the masthead. */
.masthead::after {
  content: '';
  display: block;
  height: 3px;
  margin: 1.5rem 0 0;
  border-radius: 2px;
  background: var(--saffron);
}

.footer {
  margin-top: 3rem;
  color: var(--muted);
  font-size: 0.8125rem;
  text-align: center;
}

.footer p {
  max-width: 30rem;
  margin: 0 auto;
}
</style>
