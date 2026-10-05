// Checks every question file before deploy: valid JS, valid answer indexes, no duplicate options or topic ids.
// Run locally with: node scripts/validate.js
const path = require('path');
global.window = global;

const files = ['_init', 'foundations', 'languages', 'infra', 'devops', 'architecture', 'ai'];
for (const f of files) require(path.join(__dirname, '..', 'data', f + '.js'));

const errors = [];
const ids = new Set();
let total = 0;

for (const t of window.TOPICS) {
  if (ids.has(t.id)) errors.push(`Duplicate topic id: ${t.id}`);
  ids.add(t.id);
  if (!t.qs.length) errors.push(`${t.id}: no questions`);
  t.qs.forEach((q, i) => {
    const where = `${t.id} question ${i + 1}`;
    if (!q.q) errors.push(`${where}: missing question text`);
    if (!Array.isArray(q.o) || q.o.length < 2) errors.push(`${where}: needs at least 2 options`);
    else {
      if (!(Number.isInteger(q.a) && q.a >= 0 && q.a < q.o.length)) errors.push(`${where}: answer index ${q.a} is out of range`);
      if (new Set(q.o).size !== q.o.length) errors.push(`${where}: duplicate options`);
    }
    if (!q.e) errors.push(`${where}: missing explanation`);
  });
  total += t.qs.length;
}

if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}
console.log(`OK: ${window.TOPICS.length} topics, ${total} questions`);
