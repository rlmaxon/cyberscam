# Training Lab Content

This folder contains all the scam examples and quiz content for the Training Lab.

## How to Update Content

Each JSON file can be edited directly on the server. Changes take effect immediately — no rebuild needed.

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
  "type": "email|text|marketplace|popup",
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
  "category": "email|text|marketplace|popup",
  "question": "The question text",
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "correctAnswer": 0,
  "explanation": "Why the correct answer is correct"
}
```

`correctAnswer` is the index (0-3) of the correct option.
