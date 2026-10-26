# Training Content

This folder holds everything the lessons and the Scam Example Library show.

| File | What it is |
|------|------------|
| `modules.json` | The 8 lessons, in order: title, summary, lesson text, the 4 practice examples (`practice`), the "What To Do" checklist (`actions`), and which examples file belongs to it |
| `*-scams.json` | Scam (and some safe) examples for each lesson |
| `quiz.json` | Quick Check questions. `category` must match a lesson `key`. Each lesson uses all of its questions (6 today) |
| `final-exam.json` | Final exam questions (16 today, 2 per lesson) |

The pass mark (80%) is in `src/config.json` under `training`.

### Adding a lesson

Add an entry to `modules.json` (unique `key`, next `number`), create its examples file, list 3–4 example IDs in `practice` (include at least one safe example), and add questions to `quiz.json` with `category` set to the new key. It appears in the learning path, dashboard, and library automatically. Note that it locks the final exam for anyone who hasn't done it yet.

## How to Update Content

Edit the JSON files here, commit, and push. AWS Amplify redeploys the site automatically, and the changes go live once that build finishes (usually a few minutes). The site reads these files at runtime, so no code changes are needed to add or edit examples.

### Files

- **email-scams.json** — Email phishing examples
- **text-scams.json** — Text message (smishing) examples
- **marketplace-scams.json** — Online marketplace scam examples
- **popup-scams.json** — Browser pop-up scam examples
- **quiz.json** — Multiple-choice quiz questions

### Adding a New Example

Each example follows this structure:

```json
{
  "id": "unique-id",
  "title": "Short Descriptive Title",
  "type": "email|text|phone|popup|letter|social|website|marketplace",
  "difficulty": "beginner|intermediate|advanced",
  "isScam": true,
  "sender": "Who it appears to come from",
  "subject": "Subject line or headline",
  "body": "The full content of the scam message",
  "redFlags": ["Red flag 1", "Red flag 2"],
  "explanation": "Detailed explanation of why this is/isn't a scam",
  "howToSpot": "Quick tips for spotting this type of scam"
}
```

For legitimate (non-scam) examples, set `isScam` to `false` and leave `redFlags` as an empty array `[]`.

### Adding a Quiz Question

```json
{
  "id": "q-unique-id",
  "category": "<lesson key from modules.json>",
  "question": "The question text",
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "correctAnswer": 0,
  "explanation": "Why the correct answer is correct"
}
```

`correctAnswer` is the index (0-3) of the correct option.
