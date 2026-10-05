# Interview Prep Drills

Practice questions for CS, backend, DevOps, cloud and AI interviews: 27 topics, about 400 questions.

**Live site:** https://adssib.github.io/InterviewPrep/

## Using it

- Pick a topic from the sidebar. The sub-list jumps to any question.
- **Quiz** mode: answer, then read the explanation. **Study** mode shows every answer. **Flashcards** flip with a click or space; arrow keys move.
- Filter by **Unanswered** or **Missed** to drill weak spots.
- Progress is saved in your browser (localStorage), so it's per device.

## Adding a deep dive (no code)

Deep dives are open-ended questions with follow-ups. Each one is a Markdown file in `deep-dives/`.

1. On GitHub, open the `deep-dives/` folder and open `_TEMPLATE.md`. Copy its contents.
2. Click **Add file → Create new file**, name it something like `docker-image-too-big.md`, paste, and fill it in.
3. Commit. The pipeline builds it and deploys the site in about a minute.

The template explains every field. The short version:

```md
---
title: Docker image is too big
type: scenario        # chain | scenario | compare | estimate | checklist
topic: docker         # links to a quiz drill (optional)
tags: docker, security
---

## Question
The question as the interviewer asks it.

## Short answer
The 30-second version. Hidden until you click "Show answer".

## Follow-ups
### A follow-up question?
Its answer. Follow-ups are revealed one at a time.

## Any other heading
Steps, tables, diagrams, checklists (- [ ] item), code blocks. Shown after the answer.
```

If a file has a mistake (missing title, unknown type or topic), the pipeline fails with a message naming the file and the problem, and the live site stays as it was.

To preview locally: `npm install`, `npm run build`, then open `index.html`.

## Adding quiz questions

Questions live in `data/*.js`. Each topic is one `addTopic(...)` call, and each question is a row:

```js
["Question text with `inline code`", ["Option A", "Option B", "Option C"], 0, "Explanation", "optional code block"]
```

The third value is the index of the correct option. Options are shuffled when displayed, so put the correct one anywhere.

To add a new topic group, add its name to `GROUP_ORDER` in `assets/app.js`. To add a new data file, add a `<script>` tag for it in `index.html` before `assets/app.js`.

No build step; it's plain HTML, CSS and JS.

## Deploys

Every push to `main` runs `.github/workflows/deploy.yml`: it builds the deep dives from Markdown, checks script syntax, runs `node scripts/validate.js` on the question data, and deploys to GitHub Pages only if both pass. Pull requests run the checks without deploying. Run the validator locally before pushing with `node scripts/validate.js`.
