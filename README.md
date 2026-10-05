# Interview Prep Drills

Practice questions for CS, backend, DevOps, cloud and AI interviews: 27 topics, about 400 questions.

**Live site:** https://adssib.github.io/InterviewPrep/

## Using it

- Pick a topic from the sidebar. The sub-list jumps to any question.
- **Quiz** mode: answer, then read the explanation. **Study** mode shows every answer. **Flashcards** flip with a click or space; arrow keys move.
- Filter by **Unanswered** or **Missed** to drill weak spots.
- Progress is saved in your browser (localStorage), so it's per device.

## Adding questions

Questions live in `data/*.js`. Each topic is one `addTopic(...)` call, and each question is a row:

```js
["Question text with `inline code`", ["Option A", "Option B", "Option C"], 0, "Explanation", "optional code block"]
```

The third value is the index of the correct option. Options are shuffled when displayed, so put the correct one anywhere.

To add a new topic group, add its name to `GROUP_ORDER` in `assets/app.js`. To add a new data file, add a `<script>` tag for it in `index.html` before `assets/app.js`.

No build step; it's plain HTML, CSS and JS.

## Deploys

Every push to `main` runs `.github/workflows/deploy.yml`: it checks script syntax, runs `node scripts/validate.js` on the question data, and deploys to GitHub Pages only if both pass. Pull requests run the checks without deploying. Run the validator locally before pushing with `node scripts/validate.js`.
