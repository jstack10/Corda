const ROUTES = { home: 'home', journal: 'journal', entry: 'entry', stats: 'stats' };

function getStore() {
  const key = 'reflect.store.v1';
  const raw = localStorage.getItem(key);
  if (raw) { try { return JSON.parse(raw); } catch {} }
  const seed = {
    entries: [
      { id: crypto.randomUUID(), createdAt: Date.now() - 86400000, title: 'Gratitude: small wins', text: 'I enjoyed a quiet walk and finished a tough task.', mood: '🙂' },
      { id: crypto.randomUUID(), createdAt: Date.now() - 86400000*3, title: 'Challenge noted', text: 'Felt overwhelmed, but breaking tasks down helped.', mood: '😌' }
    ]
  };
  localStorage.setItem(key, JSON.stringify(seed));
  return seed;
}
function setStore(next) { localStorage.setItem('reflect.store.v1', JSON.stringify(next)); }
function formatDate(ts) { return new Date(ts).toLocaleString([], { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }); }

function appShell(inner) {
  return `
  <div class="app-shell">
    <header class="topbar">
      <div class="container topbar-inner">
        <div class="brand"><div class="logo"></div> Reflect</div>
        <nav class="tabs" role="tablist">
          ${tab('Home', ROUTES.home)}
          ${tab('Journal', ROUTES.journal)}
          ${tab('Stats', ROUTES.stats)}
        </nav>
      </div>
    </header>
    <main class="content"><div class="container">${inner}</div></main>
    <footer class="footer"><div class="container"><span>Prototype — no data leaves your browser</span><span>v0.1</span></div></footer>
  </div>`;
}
function tab(label, route) {
  const active = getRoute().name === route ? 'active' : '';
  return `<button class="tab ${active}" data-route="${route}">${label}</button>`;
}
function getRoute() {
  const hash = location.hash.replace('#','').trim();
  if (!hash) return { name: ROUTES.home };
  const [name, id] = hash.split(':'); return { name, id };
}
function navigate(name, id) {
  const suffix = id ? `:${id}` : '';
  if (getRoute().name === name && getRoute().id === id) { render(); return; }
  location.hash = `${name}${suffix}`;
}

function viewHome() {
  const prompt = pickPrompt();
  return `
  <div class="grid two">
    <section class="panel prompt-card">
      <h2 class="headline">Today\'s Prompt</h2>
      <p class="subtle">${new Date().toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' })}</p>
      <div class="prompt">${prompt}</div>
      <textarea class="textarea" id="entry-text" placeholder="Write a few sentences..."></textarea>
      <div class="controls">
        <button class="btn ghost" data-action="clear-text">Clear</button>
        <button class="btn primary" data-action="save-entry">Save Entry</button>
      </div>
    </section>
    <section class="panel">
      <h3 class="headline">Recent Entries</h3>
      ${listEntries(3)}
      <div class="controls" style="margin-top:10px; justify-content:flex-start;">
        <button class="btn" data-route="${ROUTES.journal}">Open Journal</button>
      </div>
    </section>
  </div>`;
}
function viewJournal() {
  return `
  <section class="panel">
    <h2 class="headline">Journal</h2>
    <p class="subtle">All your entries in one place</p>
    ${listEntries()}
  </section>`;
}
function viewEntry(id) {
  const store = getStore();
  const entry = store.entries.find(e => e.id === id);
  if (!entry) return `<div class="panel empty">Entry not found.</div>`;
  return `
  <section class="panel">
    <div class="controls" style="justify-content:space-between; margin-bottom:8px;">
      <button class="btn" data-route="${ROUTES.journal}">Back</button>
      <button class="btn danger" data-action="delete-entry" data-id="${entry.id}">Delete</button>
    </div>
    <h2 class="headline">${escapeHtml(entry.title || 'Untitled')}</h2>
    <p class="subtle">${formatDate(entry.createdAt)} · ${entry.mood || '🙂'}</p>
    <div style="height:8px"></div>
    <div style="white-space: pre-wrap; line-height:1.6">${escapeHtml(entry.text)}</div>
  </section>`;
}
function viewStats() {
  const store = getStore();
  const total = store.entries.length;
  const week = store.entries.filter(e => Date.now() - e.createdAt < 7*24*60*60*1000).length;
  const streak = computeStreak(store.entries);
  return `
  <div class="grid two">
    <section class="panel">
      <h2 class="headline">Overview</h2>
      <div class="grid" style="grid-template-columns: repeat(3, 1fr);">
        <div class="stat"><div class="value">${total}</div><div class="label">Total entries</div></div>
        <div class="stat"><div class="value">${week}</div><div class="label">This week</div></div>
        <div class="stat"><div class="value">${streak}</div><div class="label">Day streak</div></div>
      </div>
    </section>
    <section class="panel">
      <h3 class="headline">Tips</h3>
      <ul class="list">
        <li class="item"><div><div class="item-title">Keep it short</div><div class="item-meta">A few sentences daily beats long weekly essays</div></div></li>
        <li class="item"><div><div class="item-title">Reflect, don\'t judge</div><div class="item-meta">Note what happened and how you felt</div></div></li>
        <li class="item"><div><div class="item-title">Revisit highlights</div><div class="item-meta">Browse your journal to reinforce positives</div></div></li>
      </ul>
    </section>
  </div>`;
}
function listEntries(limit) {
  const store = getStore();
  const items = store.entries.slice().sort((a,b)=>b.createdAt-a.createdAt).slice(0, limit || store.entries.length);
  if (!items.length) return `<div class="empty">No entries yet.</div>`;
  return `<div class="list">${items.map(e => `
    <div class="item">
      <div>
        <div class="item-title">${escapeHtml(e.title || 'Untitled')} ${e.mood || ''}</div>
        <div class="item-meta">${formatDate(e.createdAt)}</div>
      </div>
      <div><button class="btn" data-route="${ROUTES.entry}:${e.id}">Open</button></div>
    </div>`).join('')}</div>`;
}
function computeStreak(entries) {
  const days = new Set(entries.map(e => new Date(e.createdAt).toDateString()));
  let d = new Date(); let streak = 0;
  while (days.has(d.toDateString())) { streak += 1; d.setDate(d.getDate() - 1); }
  return streak;
}
function pickPrompt() {
  const prompts = [
    'What went well today, and why?',
    'What challenged you today?',
    "Name three things you're grateful for.",
    'What did you learn about yourself today?',
    'If today had a theme, what would it be?'
  ];
  return prompts[Math.floor(Math.random() * prompts.length)];
}
function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, s => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[s]));
}
function wireGlobalHandlers() {
  document.addEventListener('click', (e) => {
    const routeBtn = e.target.closest('[data-route]');
    if (routeBtn) { const [name, id] = String(routeBtn.getAttribute('data-route')).split(':'); navigate(name, id); return; }
    const actionBtn = e.target.closest('[data-action]');
    if (actionBtn) {
      const action = actionBtn.getAttribute('data-action');
      if (action === 'save-entry') onSaveEntry();
      if (action === 'clear-text') onClearText();
      if (action === 'delete-entry') onDeleteEntry(actionBtn.getAttribute('data-id'));
    }
  });
  window.addEventListener('hashchange', render);
}
function onSaveEntry() {
  const textarea = document.querySelector('#entry-text'); if (!textarea) return;
  const text = textarea.value.trim(); if (!text) { textarea.focus(); return; }
  const lines = text.split('\n').map(s=>s.trim()).filter(Boolean);
  const title = (lines[0] || 'Reflection').slice(0, 60);
  const moods = ['🙂','😌','😅','😔','😃','🤔'];
  const store = getStore();
  store.entries.push({ id: crypto.randomUUID(), createdAt: Date.now(), title, text, mood: moods[Math.floor(Math.random()*moods.length)] });
  setStore(store);
  navigate(ROUTES.journal);
}
function onClearText() { const t = document.querySelector('#entry-text'); if (t) t.value = ''; }
function onDeleteEntry(id) { const s = getStore(); setStore({ ...s, entries: s.entries.filter(e => e.id !== id) }); navigate(ROUTES.journal); }
function render() {
  const route = getRoute(); let inner = '';
  if (route.name === ROUTES.home) inner = viewHome();
  else if (route.name === ROUTES.journal) inner = viewJournal();
  else if (route.name === ROUTES.entry) inner = viewEntry(route.id);
  else if (route.name === ROUTES.stats) inner = viewStats();
  else inner = viewHome();
  document.getElementById('app').innerHTML = appShell(inner);
}
wireGlobalHandlers(); render();
