(function () {
  'use strict';

  var TOPICS = window.TOPICS || [];
  var GROUP_ORDER = [
    'CS Foundations',
    'Languages & Code',
    'Containers & Infrastructure',
    'Delivery & Operations',
    'Architecture',
    'AI & LLMs'
  ];
  var STORE_KEY = 'ip-progress-v1';
  var LETTERS = 'ABCDEFGH';

  // ---------- storage ----------
  var progress = {};
  try { progress = JSON.parse(localStorage.getItem(STORE_KEY) || '{}') || {}; } catch (e) { progress = {}; }
  function save() { try { localStorage.setItem(STORE_KEY, JSON.stringify(progress)); } catch (e) {} }
  function answersFor(id) { return progress[id] || (progress[id] = {}); }

  // ---------- helpers ----------
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  // escape, then turn `code` spans into <code>
  function fmt(s) { return esc(s).replace(/`([^`]+)`/g, '<code>$1</code>'); }
  function hash(str) { var h = 2166136261; for (var i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  function seeded(seed) { return function () { seed = (seed + 0x6D2B79F5) | 0; var t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t ^= t + Math.imul(t ^ (t >>> 7), 61 | t); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  // stable shuffled order of option indexes for a question
  function optionOrder(topicId, qi, n) {
    var rnd = seeded(hash(topicId + ':' + qi));
    var arr = []; for (var i = 0; i < n; i++) arr.push(i);
    for (var j = n - 1; j > 0; j--) { var k = Math.floor(rnd() * (j + 1)); var t = arr[j]; arr[j] = arr[k]; arr[k] = t; }
    return arr;
  }
  function topicById(id) { for (var i = 0; i < TOPICS.length; i++) if (TOPICS[i].id === id) return TOPICS[i]; return null; }
  function stats(t) {
    var ans = progress[t.id] || {}, done = 0, right = 0;
    t.qs.forEach(function (q, i) { if (ans[i] !== undefined) { done++; if (ans[i] === q.a) right++; } });
    return { done: done, right: right, total: t.qs.length };
  }
  function grouped() {
    var g = {};
    TOPICS.forEach(function (t) { (g[t.group] = g[t.group] || []).push(t); });
    return GROUP_ORDER.filter(function (name) { return g[name]; }).map(function (name) { return { name: name, topics: g[name] }; });
  }

  // ---------- state ----------
  var el = {
    toc: document.getElementById('toc'),
    content: document.getElementById('content'),
    search: document.getElementById('search'),
    sidebar: document.getElementById('sidebar'),
    scrim: document.getElementById('scrim'),
    menuBtn: document.getElementById('menuBtn'),
    themeBtn: document.getElementById('themeBtn'),
    total: document.getElementById('totalProgress')
  };
  var current = null;           // topic id or null for home
  var mode = 'quiz';            // quiz | study | cards
  var filter = 'all';           // all | unanswered | missed
  var cardIdx = 0, cardFlipped = false;
  var query = '';

  // ---------- sidebar ----------
  function matches(t) {
    if (!query) return true;
    var q = query.toLowerCase();
    if ((t.title + ' ' + t.blurb).toLowerCase().indexOf(q) !== -1) return true;
    return t.qs.some(function (x) { return x.q.toLowerCase().indexOf(q) !== -1; });
  }
  function renderToc() {
    var html = '';
    var any = false;
    grouped().forEach(function (g) {
      var items = g.topics.filter(matches);
      if (!items.length) return;
      any = true;
      html += '<div class="toc-group"><p class="toc-group-title">' + esc(g.name) + '</p>';
      items.forEach(function (t) {
        var s = stats(t);
        var active = t.id === current;
        html += '<a class="toc-link' + (active ? ' active' : '') + '" href="#' + t.id + '">' +
          '<span class="name">' + esc(t.title) + '</span>' +
          '<span class="count' + (s.done === s.total ? ' done' : '') + '">' + s.done + '/' + s.total + '</span></a>';
        if (active && mode !== 'cards') {
          var ans = progress[t.id] || {};
          html += '<div class="toc-sub">';
          t.qs.forEach(function (q, i) {
            if (query && q.q.toLowerCase().indexOf(query.toLowerCase()) === -1 && t.title.toLowerCase().indexOf(query.toLowerCase()) === -1) return;
            var cls = ans[i] === undefined ? '' : (ans[i] === q.a ? ' ok' : ' no');
            html += '<a href="#' + t.id + '" class="jump' + cls + '" data-q="' + i + '" title="' + esc(q.q) + '">' + (i + 1) + '. ' + esc(q.q.replace(/`/g, '')) + '</a>';
          });
          html += '</div>';
        }
      });
      html += '</div>';
    });
    if (!any) html = '<p class="toc-empty">No topics match "' + esc(query) + '".</p>';
    el.toc.innerHTML = html;

    var totals = TOPICS.reduce(function (acc, t) { var s = stats(t); acc.d += s.done; acc.n += s.total; return acc; }, { d: 0, n: 0 });
    el.total.textContent = totals.d + ' / ' + totals.n + ' answered';
  }

  // ---------- home ----------
  function renderHome() {
    var totalQ = 0, done = 0, right = 0;
    TOPICS.forEach(function (t) { var s = stats(t); totalQ += s.total; done += s.done; right += s.right; });
    var html = '<section class="hero"><h1>Interview Prep Drills</h1>' +
      '<p>Practice questions for backend, DevOps, cloud and AI interviews. Answer in quiz mode, review everything in study mode, or flip through flashcards. Your answers are saved in this browser.</p>' +
      '<div class="stats">' +
      '<div class="stat"><b>' + TOPICS.length + '</b><span>Topics</span></div>' +
      '<div class="stat"><b>' + totalQ + '</b><span>Questions</span></div>' +
      '<div class="stat"><b>' + done + '</b><span>Answered</span></div>' +
      '<div class="stat"><b>' + (done ? Math.round(right / done * 100) : 0) + '%</b><span>Correct</span></div>' +
      '</div></section>';
    grouped().forEach(function (g) {
      html += '<section class="group-block"><h2>' + esc(g.name) + '</h2><div class="topic-grid">';
      g.topics.forEach(function (t) {
        var s = stats(t);
        html += '<a class="topic-card" href="#' + t.id + '"><h3>' + esc(t.title) + '</h3><p>' + esc(t.blurb) + '</p>' +
          '<span class="meta">' + s.done + '/' + s.total + ' answered' + (s.done ? ' · ' + s.right + ' correct' : '') + '</span>' +
          '<div class="bar"><i style="width:' + (s.done / s.total * 100) + '%"></i></div></a>';
      });
      html += '</div></section>';
    });
    html += '<section class="group-block"><button class="btn" id="resetAll">Reset all progress</button></section>';
    el.content.innerHTML = '<div>' + html + '</div>';
    armReset(document.getElementById('resetAll'), 'Click again to erase everything', function () { progress = {}; save(); render(); });
  }

  // two-step confirm (confirm() is not available everywhere)
  function armReset(btn, armedText, action) {
    if (!btn) return;
    var label = btn.textContent, timer;
    btn.addEventListener('click', function () {
      if (btn.classList.contains('danger-armed')) { clearTimeout(timer); action(); return; }
      btn.classList.add('danger-armed'); btn.textContent = armedText;
      timer = setTimeout(function () { btn.classList.remove('danger-armed'); btn.textContent = label; }, 3000);
    });
  }

  // ---------- topic ----------
  function visibleIndexes(t) {
    var ans = progress[t.id] || {};
    var out = [];
    t.qs.forEach(function (q, i) {
      if (filter === 'unanswered' && ans[i] !== undefined) return;
      if (filter === 'missed' && (ans[i] === undefined || ans[i] === q.a)) return;
      out.push(i);
    });
    return out;
  }

  function questionHTML(t, i) {
    var q = t.qs[i];
    var ans = (progress[t.id] || {})[i];
    var reveal = mode === 'study' || ans !== undefined;
    var order = optionOrder(t.id, i, q.o.length);
    var h = '<article class="q" id="q-' + i + '"><div class="q-num">QUESTION ' + (i + 1) + ' OF ' + t.qs.length + '</div>' +
      '<h3>' + fmt(q.q) + '</h3>' + (q.c ? '<pre><code>' + esc(q.c) + '</code></pre>' : '') + '<div class="opts">';
    order.forEach(function (oi, pos) {
      var cls = '';
      if (reveal) {
        if (oi === q.a) cls = ' correct';
        else if (oi === ans) cls = ' wrong';
        else cls = ' dim';
      }
      h += '<button class="opt' + cls + '" data-t="' + t.id + '" data-q="' + i + '" data-o="' + oi + '"' + (reveal ? ' disabled' : '') + '>' +
        '<span class="key">' + LETTERS[pos] + '</span><span class="txt">' + fmt(q.o[oi]) + '</span></button>';
    });
    h += '</div>';
    if (reveal) {
      var verdict = '';
      if (mode !== 'study' || ans !== undefined) verdict = ans === q.a ? '<span class="verdict ok">Correct.</span>' : (ans !== undefined ? '<span class="verdict no">Not quite.</span>' : '');
      h += '<div class="exp">' + verdict + fmt(q.e) + '</div>';
    }
    return h + '</article>';
  }

  function renderTopic(t) {
    var s = stats(t);
    var html = '<div class="topic-head"><span class="crumb">' + esc(t.group) + '</span><h1>' + esc(t.title) + '</h1><p>' + esc(t.blurb) + '</p></div>' +
      '<div class="toolbar">' +
      '<div class="seg" role="group" aria-label="Mode">' +
      ['quiz', 'study', 'cards'].map(function (m) {
        return '<button data-mode="' + m + '" aria-pressed="' + (mode === m) + '">' + { quiz: 'Quiz', study: 'Study', cards: 'Flashcards' }[m] + '</button>';
      }).join('') + '</div>';
    if (mode !== 'cards') {
      html += '<div class="seg" role="group" aria-label="Filter">' +
        ['all', 'unanswered', 'missed'].map(function (f) {
          return '<button data-filter="' + f + '" aria-pressed="' + (filter === f) + '">' + { all: 'All', unanswered: 'Unanswered', missed: 'Missed' }[f] + '</button>';
        }).join('') + '</div>';
    }
    html += '<button class="btn" id="resetTopic">Reset topic</button>' +
      '<span class="score"><b>' + s.right + '</b> right · <s>' + (s.done - s.right) + '</s> wrong · ' + s.done + '/' + s.total + '</span></div>';

    if (mode === 'cards') {
      html += cardsHTML(t);
    } else {
      var idx = visibleIndexes(t);
      if (!idx.length) {
        html += '<p class="empty">' + (filter === 'missed' ? 'No missed questions here. Nice.' : 'Every question in this topic is answered. Switch to All or Missed to review.') + '</p>';
      } else {
        html += '<div class="qlist">' + idx.map(function (i) { return questionHTML(t, i); }).join('') + '</div>';
      }
    }
    el.content.innerHTML = '<div>' + html + '</div>';
    armReset(document.getElementById('resetTopic'), 'Click again to reset', function () { delete progress[t.id]; save(); render(); });
  }

  function cardsHTML(t) {
    if (cardIdx >= t.qs.length) cardIdx = 0;
    var q = t.qs[cardIdx];
    var body = cardFlipped
      ? '<span class="side">Answer</span><p class="ans">' + fmt(q.o[q.a]) + '</p><p class="why">' + fmt(q.e) + '</p>'
      : '<span class="side">Question</span><h3>' + fmt(q.q) + '</h3>' + (q.c ? '<pre><code>' + esc(q.c) + '</code></pre>' : '') + '<span class="hint-line">Click or press space to flip</span>';
    return '<div class="card-stage"><button class="flash" id="flash" aria-live="polite">' + body + '</button>' +
      '<div class="flash-nav"><button class="btn" id="prevCard">Previous</button>' +
      '<span class="pos">' + (cardIdx + 1) + ' / ' + t.qs.length + '</span>' +
      '<button class="btn" id="nextCard">Next</button></div>' +
      '<p class="hint-line">Arrow keys move between cards.</p></div>';
  }

  // ---------- routing ----------
  function render(keepScroll) {
    var id = (location.hash || '').replace(/^#/, '');
    var t = topicById(id);
    var changed = (t ? t.id : null) !== current;
    current = t ? t.id : null;
    if (changed) { cardIdx = 0; cardFlipped = false; }
    var y = window.scrollY;
    if (t) renderTopic(t); else renderHome();
    renderToc();
    if (changed) { window.scrollTo(0, 0); closeMenu(); } else if (keepScroll) { window.scrollTo(0, y); }
    document.title = t ? t.title + ' · Interview Prep Drills' : 'Interview Prep Drills';
  }

  // ---------- events ----------
  el.content.addEventListener('click', function (e) {
    var opt = e.target.closest('.opt');
    if (opt && !opt.disabled) {
      var tid = opt.getAttribute('data-t'), qi = +opt.getAttribute('data-q'), oi = +opt.getAttribute('data-o');
      answersFor(tid)[qi] = oi; save();
      var t = topicById(tid);
      var card = document.getElementById('q-' + qi);
      if (card) card.outerHTML = questionHTML(t, qi);
      // refresh score + toc without re-rendering the list (keeps the card in place)
      var s = stats(t);
      var sc = el.content.querySelector('.score');
      if (sc) sc.innerHTML = '<b>' + s.right + '</b> right · <s>' + (s.done - s.right) + '</s> wrong · ' + s.done + '/' + s.total;
      renderToc();
      return;
    }
    var m = e.target.closest('[data-mode]');
    if (m) { mode = m.getAttribute('data-mode'); cardFlipped = false; render(); return; }
    var f = e.target.closest('[data-filter]');
    if (f) { filter = f.getAttribute('data-filter'); render(true); return; }
    if (e.target.closest('#flash')) { cardFlipped = !cardFlipped; render(true); return; }
    if (e.target.closest('#nextCard')) { stepCard(1); return; }
    if (e.target.closest('#prevCard')) { stepCard(-1); return; }
  });

  function stepCard(d) {
    var t = topicById(current); if (!t) return;
    cardIdx = (cardIdx + d + t.qs.length) % t.qs.length; cardFlipped = false; render(true);
  }

  document.addEventListener('keydown', function (e) {
    if (mode !== 'cards' || !current) return;
    if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) return;
    if (e.key === 'ArrowRight') { stepCard(1); e.preventDefault(); }
    else if (e.key === 'ArrowLeft') { stepCard(-1); e.preventDefault(); }
    else if (e.key === ' ' && e.target.id !== 'flash') { cardFlipped = !cardFlipped; render(true); e.preventDefault(); }
  });

  el.toc.addEventListener('click', function (e) {
    var j = e.target.closest('.jump');
    if (!j) return;
    e.preventDefault();
    var qi = j.getAttribute('data-q');
    var node = document.getElementById('q-' + qi);
    if (!node && filter !== 'all') { filter = 'all'; render(); node = document.getElementById('q-' + qi); }
    if (node) node.scrollIntoView({ behavior: 'smooth', block: 'start' });
    closeMenu();
  });

  el.search.addEventListener('input', function () { query = el.search.value.trim(); renderToc(); });

  function openMenu() { el.sidebar.classList.add('open'); el.scrim.hidden = false; el.menuBtn.setAttribute('aria-expanded', 'true'); }
  function closeMenu() { el.sidebar.classList.remove('open'); el.scrim.hidden = true; el.menuBtn.setAttribute('aria-expanded', 'false'); }
  el.menuBtn.addEventListener('click', function () { el.sidebar.classList.contains('open') ? closeMenu() : openMenu(); });
  el.scrim.addEventListener('click', closeMenu);

  el.themeBtn.addEventListener('click', function () {
    var root = document.documentElement;
    var cur = root.getAttribute('data-theme');
    if (!cur) cur = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    var next = cur === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('ip-theme', next); } catch (e) {}
  });

  window.addEventListener('hashchange', function () { render(); });
  render();
})();
