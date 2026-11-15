<template>
  <div class="page">
    <NuxtRouteAnnouncer />
    <header class="masthead">
      <img class="logo" src="/logo.png" alt="" width="96" height="96" />
      <h1>The Daily Paella</h1>
      <p>Spanish news, summarised in English.</p>
    </header>

    <main>
      <NuxtPage />
    </main>

    <footer class="footer">
      <p>
        Summaries are machine-generated from each outlet's public RSS feed and may contain errors.
        Always read the original article.
      </p>
    </footer>
  </div>
</template>

<style>
:root {
  --bg: #fbf8f1;
  --text: #1f1b16;
  --muted: #6b6257;
  --accent: #b3261e;
  --rule: #e2d9c8;
  color-scheme: light dark;
}

@media (prefers-color-scheme: dark) {
  :root {
    --bg: #16130f;
    --text: #efe9dd;
    --muted: #a39a8c;
    --accent: #ff8a7a;
    --rule: #332d25;
  }
}

body {
  margin: 0;
  background: var(--bg);
  color: var(--text);
  font-family: Georgia, 'Times New Roman', serif;
  line-height: 1.5;
}

a {
  color: inherit;
}

.page {
  max-width: 42rem;
  margin: 0 auto;
  padding: 2rem 1rem 3rem;
}

.masthead {
  border-bottom: 3px double var(--rule);
  padding-bottom: 1rem;
  margin-bottom: 1.5rem;
  text-align: center;
}

.logo {
  display: block;
  margin: 0 auto 0.5rem;
}

.masthead h1 {
  margin: 0;
  font-size: 2.25rem;
}

.masthead p {
  margin: 0.25rem 0 0;
  color: var(--muted);
  font-style: italic;
}

.footer {
  margin-top: 2.5rem;
  padding-top: 1rem;
  border-top: 1px solid var(--rule);
  color: var(--muted);
  font-size: 0.875rem;
}
</style>
