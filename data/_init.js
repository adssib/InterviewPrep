// Each question row: [question, [options...], correctIndex, explanation, optionalCodeBlock]
// Wrap inline code in backticks; it renders as <code>.
window.TOPICS = [];
window.addTopic = function (id, group, title, blurb, rows) {
  window.TOPICS.push({
    id: id,
    group: group,
    title: title,
    blurb: blurb,
    qs: rows.map(function (r) { return { q: r[0], o: r[1], a: r[2], e: r[3], c: r[4] || '' }; })
  });
};
