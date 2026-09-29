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

Sign-up accepts any email, or Continue with Google or Microsoft. Nothing leaves the browser. Events print in the console as `[event] name` plus tags.

## Commits

On top of `a125d79` Initialise repository:

1. `181689b` Import readywhen-growth-challenge starter
2. `7d065d3` Task 1: Instrument the funnel so drops inside a step are visible
3. `217b0ec` Task 2: Connect step 30% → 38% by asking for one source
4. `1ce7b14` Task 2: Board step 75% → 86% by making the board the next click
5. `98d9bfd` Task 2: Name + survey 85% → 92% by dropping fields that block the first session
6. `5f767f1` Task 3: Experiment with promise-first, value on the board before Gmail
7. `e5ec797` Add written answers and submission notes (`WRITTEN-ANSWERS.md`, this file)

If this history arrives through a pull request, merge it with a merge commit, or rebase it onto `main`. Do not squash. Squashing collapses the three Task 2 changes into one diff, and the brief was to read each change on its own.
