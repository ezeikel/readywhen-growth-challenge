# readywhen — growth challenge

A working mock of the readywhen sign-up funnel, from sign-in to chat. Clone it,
run it, and use it as the ground for your work.

## Before you start

Please spend no more than **3 to 4 hours** in total, coding and write-ups
together. If anything is unclear, get in touch — asking is fine.

Two things you can assume throughout:

- We get about **250 sign-ups a week**.
- Our **ICP** is the owner or founder of a small service business (1–10 people):
  agencies, consultancies, studios, trades. They run their day from email,
  calendar and meetings, make promises to clients in all three, and lose track of
  them. No ops team, no PM, no assistant.

Our **North Star** for onboarding is sign-up → engaged in the first session,
which we define as connected a source and reached the board (marked in
`data/funnel.md`).

## How we read your work

Every change you make should be something we could put in front of real traffic
tomorrow and know, a few weeks later, whether it worked. Write it up so that a
colleague who disagrees with you could point at the exact number that would prove
them right or you wrong. We'd rather read one claim we can check than three that
sound plausible.

## Task 1 — Instrument the funnel

The app emits no analytics. `recordBusinessEvent(name, tags?)` in
`src/lib/metrics.ts` writes to the console and nothing else.

Add calls to it across the funnel so the sign-up flow can be measured end to end.
Choosing the events and their tags is the task. As a bar: someone reading your
events should be able to answer questions `data/funnel.md` cannot — where inside
a step people leave, and how long they took to decide.

## Task 2 — Improve the funnel

`data/funnel.md` is the real step-by-step conversion of our production
onboarding. Read it, work out where it is losing people relative to the North
Star and why, and prioritise.

Then change the funnel in this repo to fix it — copy, order of steps, adding or
removing a step, the design of a screen. One to three changes, not a rewrite.
This is not an A/B test: change the default and commit it, one commit per change.
Each change names the step it should move and by how much you'd expect.

The last step is the exception: the 2nd Brain takes about a week to generate and
isn't something the user does, so nothing here can move it. Pick a step you can
actually affect.

Write `reports/task-2.md`: what you found in the data, what you changed and why,
and what you expect to happen.

## Task 3 — Run an experiment

Task 2 was surgery: the data points at a step, you fix that step. This is a bet,
and the data will not tell you to make it. We are not only reading how you run an
experiment here, we are reading what you came up with. The idea is half the
answer.

Design one experiment you believe could move the North Star fundamentally — a
different shape for onboarding, half the screens, a different order, a different
promise, asking for the connection somewhere else entirely, pulling in something
else from the app (the 2nd Brain, drafts, the board) — whatever your instinct
says is worth finding out. A completely new flow is fair game if you can argue
for it.

Be as creative as you can here. Nothing in this repo is sacred: rip out steps,
invert the order, change what we ask for and when, change what we promise, put
onboarding somewhere it has never been. The obvious tweaks (shorter copy, fewer
fields, a different button colour) are ones we could have written ourselves, and
they teach us the least. No idea is too strange to propose as long as you can
argue for it and name the number that would prove you wrong. Don't hold back the
odd one because you think we want the safe one. We don't.

`src/lib/experiments.ts` is the shell. Register the experiment, build both arms,
record the exposure, and say what share of traffic you'd give it. There's no real
traffic here, so arms switch with a query parameter and we'll run both. It ships
with one throwaway example — open `/signup?signup-headline=direct` to see it
work, then replace it. The control arm is the funnel as you left it after Task 2.

Write `reports/task-3.md`: what you believe, the metric that settles it and what
number on it means it won, anything you'd watch to make sure the win is real, the
traffic split and why, how long you'd need to run it given our volume, and what
you'd do if it lost.

We'd rather read a strange, ambitious idea argued honestly than a safe one that
can't teach us anything.

## Running and submitting

```bash
git clone https://github.com/olivahealth/readywhen-growth-challenge.git
cd readywhen-growth-challenge
npm install
npm run dev          # http://localhost:3000
```

Please don't fork. Push to a new public repository under your own account and
send us the link. Commit tasks in order — Task 1, then each Task 2 change,
then Task 3 — so we can read each on its own.
