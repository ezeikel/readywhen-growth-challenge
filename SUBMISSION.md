# Submission

Ezeikel Pemberton. Growth challenge for readywhen.

Read the commits in order. Each task is its own commit. Task 2 is three commits, one change each. The write-ups are `reports/task-2.md`, `reports/task-3.md` and `WRITTEN-ANSWERS.md`.

`data/funnel.md` has connect at 30%. The written-answer sheet says 45%. `WRITTEN-ANSWERS.md` says which figure each answer uses. Tasks 1 to 3 use 30%.

## How to run

```bash
npm install
npm run dev
```

Open http://localhost:3000

| Arm | URL |
|---|---|
| Control, the funnel after Task 2 | http://localhost:3000/signup |
| Control, explicit | http://localhost:3000/signup?first-session=control |
| Promise-first | http://localhost:3000/signup?first-session=promise-first |

The old `?signup-headline=direct` example is gone.

Start over, bottom corner, wipes the session and the remembered arm and returns to `/signup`. To see the other arm after that, use the URL. The parameter wins over whatever the tab had stored.

To see the board fail to load, open `/inbox?board=fail` (an error) or `/inbox?board=slow` (a timeout) after connecting a source. It retries once on its own, then shows Retry.

Sign-up accepts any email, or Continue with Google or Microsoft. Nothing leaves the browser. Events print in the console as `[event] name` plus tags.

## Commits

1. `7239290` Initialise repository
2. `9c85c74` Import readywhen-growth-challenge starter
3. `750d936` Task 1: Instrument the funnel so drops inside a step are visible
4. `8a6416c` Task 2: Connect step 30% to 38% by asking for one source
5. `6e0cb09` Task 2: Board step 75% to 86% by making the board the next click (the button, plus a loading state and retry for a failed load)
6. `6854db8` Task 2: Name + survey 85% to 92% by dropping fields that block the first session
7. `d2b45fd` Task 3: Experiment with promise-first, value on the board before Gmail
8. Add written answers and submission notes (`WRITTEN-ANSWERS.md`, this file)
