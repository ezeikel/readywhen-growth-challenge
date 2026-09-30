# Written answers

Short on purpose. The figures in Tasks 1 to 3 use `data/funnel.md`, where connect is 30% of the people who reach it. The sheet for these questions says 45%. These are different supplied baselines; for the same cohort and step definition they disagree: 30% is what multiplies out to the funnel's own "20% of sign-ups connect, 15% reach the board". I flag the mismatch on every answer that uses the step, and I say which figure I am on.

Session 1, wherever I use it: starts at `signup.completed`, ends after 30 minutes with no further event from that browser.

## Q1

Activation metric: `inbox.viewed` with `connected_count` at least 1, during session 1.

That is the North Star as an event pair, not a feeling. The intended value moment is seeing commitments from their connected source on the board. This mock uses seeded commitments, so it demonstrates the flow rather than proving source-derived value. `promise.board_previewed` does not count. Neither does a board view with nothing connected.

Hypothesis, not a result: if a user connects a source and lands on the board in session 1, they are 3× more likely to emit any product event in the 7 days after that session than a user who signed up and did not.

Check before building anything else. Split sign-ups into those two groups on the events from Task 1, and divide the 7-day rates. I would not build against the hypothesis until that ratio is at least 2. About 4 weeks, about 1,000 sign-ups, is the smallest cut I would trust. If the ratio is under 1.5, the board is the wrong value moment and I would run the same check on `draft.approved` in session 1 before changing the product. I have not run either check. This repo did not have the events until Task 1.

## Q2

`data/funnel.md` says 30% of people who reach connect go on to connect, which is 20% of sign-ups. The sheet says 45% of people who reach the step. I answer the 45% question, then the 30% one.

45% is bad for this product. The board is empty without a source, so the step is the product, and most people who reach it leave. It is not obviously bad against a generic optional-integration range.

Benchmark: [Userpilot's product metrics report](https://userpilot.com/saas-product-metrics/) reports median activation 37.04% and average 37.5% of sign-ups across 62 B2B SaaS companies. I have not re-analysed their sample. Trust: medium as "what share of sign-ups reach some activation", low as a benchmark for this step. Their activation is looser than granting a mailbox, and it is end to end, not a step rate. On the funnel, 15% of sign-ups reach the board. That is the comparison I would actually worry about, with low-to-medium trust because the definitions differ.

The other number I would plan with is my own rule, not a study: a connection the product cannot work without should clear 60% of the people who reach it, and an optional one can sit between 30% and 50%. Trust: low.

From the sheet's 45%, one quarter of work on this screen: **60%**. I would call the step fixed, and move on, at **70%**. At 70% it is no longer where most people leave. The rest are people who will not grant a mailbox in session 1, and another quarter on the screen returns less than the board gap or a second session.

From the funnel's 30%, same benchmark, the quarter target is **45%** and fixed is still **70%**. I would not call it fixed this quarter. Tasks 2 and 3 assume 30%.

## Q3

If the sheet is right, 55% leave. If the funnel is right, 70% leave. The two-week plan is the same. I have not done it.

Analytics, first, on people with a connect card view and no `connector.connected`:

- `chat.connect_left.last_action`: `card_seen`, `picked`, `consent_cancelled`, and `saw_card=0`. On the experiment arm, the same split is `start.left`.
- `connector.picked` with no `connector.connected` is the consent abandon. `duration_bucket` on the cancel separates a skim from a refusal.
- Break those by `provider` on `signup.completed`, by `jtbd`, by whether they toggled Gmail, and by `surface` (`chat` or `start`).
- Keep connectors who never `inbox.viewed` in a separate pile. That is the board gap, not this 55%.

That gives the size of each cluster. It does not give the sentence in their head.

Then 8 people, in these two weeks, who reached the step in the last few days and did not connect. Five is enough to hear one reason twice. Eight gives a second cluster a chance. I would take them from the events above and the email they signed up with, and write within a day for 15 minutes. I would not treat a list I do not have as if I had already pulled it.

The calls tell me which sentence: they will not hand over client mail, they think we will send on our own, they do not use Gmail, the provider screen broke on their phone. The counts tell me which of those sentences is most of the drop. Eight calls cannot tell me that. The events cannot tell me the sentence.

## Q4

1,000 sign-ups a month. Upstream of connect, from the funnel: 0.85 × 0.80 × 0.95 = 0.646, so 646 people a month reach the step. Board rate 75% unless B changes it.

A 10 point move on connect is worth 1,000 × 0.646 × 0.10 × 0.75 = **48.5** extra people on the board a month. That arithmetic does not care whether the baseline is 30% or 45%. The baseline changes B and C, and it changes what "10 points" means if you only believe the relative lift (55/45).

**Funnel baseline, connect 30%. Baseline on the board: 1,000 × 0.14535 = 145.4.**

| Option | Move | Extra people on the board / month |
|---|---|---:|
| A, +10 points, 30% to 40% | the sheet's 10 points, applied to the funnel | 48.5 |
| A, relative only, 30% to 36.7% | 30% × (55/45) | 32.3 |
| B, board 75% to 90% | 1,000 × 0.646 × 0.30 × 0.15 | 29.1 |
| C, name + survey 85% to 95% | 1,000 × 0.10 × 0.80 × 0.95 × 0.30 × 0.75 | 17.1 |

Ranking: A, then B, then C. On the relative reading, A leads B by about 3 people a month. I would not bet a sprint on that gap.

**Sheet baseline, connect 45%, other steps still from the funnel.** This fights the funnel's 15% end to end. It would put 218 people a month on the board, not 145.

| Option | Extra people / month |
|---|---:|
| A, 45% to 55% | 48.5 |
| B, 75% to 90% at a 45% connect rate | 43.6 |
| C, 85% to 95% at a 45% connect rate | 25.7 |

Ranking does not flip: A, then B, then C. A leads B by 5 people.

My own Task 2 belief is smaller than the sheet's: 8 points, not 10, and on a 30% baseline (30% to 38%). That is 1,000 × 0.646 × 0.08 × 0.75 = **38.8**. Against the funnel, 38.8 still beats B's 29.1, so I still do A. Against a true 45% baseline, 8 points is 38.8 and B is 43.6. **That ranking flips: B, then A, then C.**

I would do A, the connect rewrite, using the funnel's 30% as the baseline. It is the only figure consistent with 20% of sign-ups connecting and 15% reaching the board. I would change my mind, and do B, if we established that connect is already about 45%, or if a week of events showed `connector.consent_cancelled` as most of the drop (a rewrite will not get 10 points) or `inbox.load_failed` still firing after the automatic retry for a large share of connectors (the board gap is mostly the load failure, and those 15 points are more certain).

In the repo, the Task 2 board commit already does the cheap part of B: a loading state, one automatic retry with backoff, a Retry button, and `inbox.load_failed` / `inbox.load_retried` to size what is left. With the "Open your board" button, I estimate the step at 86%, not 90%. A board that fails every time needs the engineering fix B describes, and those events are how I would know whether it is worth the sprint.

## Q5

(1) The likely confounder is intent, or a first connection that actually worked. People who have already decided the product is for them connect more sources and come back. A second source can also be a marker that the board loaded and showed a real commitment, and that is what brings them back, not the count.

Check, before any new prompt: among people who reached the board in session 1, compare 7-day return at one source against two or more. If the gap goes away, the count was standing in for "the first connection worked". Then put "saw a commitment on the board" in the comparison. If the association with source count falls by half or more, the count was a proxy. I have not run this. I would not ship a second-source prompt until I had.

(2) I would not run that experiment first. On the funnel, 162 of 250 sign-ups a week reach connect and 113 of them connect nothing. The predictor in the question is measured on people who already connected one source. Those are different populations. The ICP's day is email, calendar and meetings. The first thing is one Gmail connection that lands on the board. That is what Task 2 and Task 3 are aimed at. A second source is the experiment after the first one is not the hole.

When I do run it: after the first source has put commitments on the board, ask for Calendar in particular, framed as the promises they made on calls.

Hypothesis: that ask raises the share of session-1 connectors who connect a second source before the session ends.

Metric: among assigned eligible users who connected their first source and reached the board in session 1, the share with `connected_count` at least 2 before that session ends.

Randomise eligible first-source users 50/50 to the ask or the existing experience. Analyse by assignment, including users who ignore the ask. The primary metric above tests whether the prompt increases second connections. The guardrail is 7-day return among all assigned eligible users, with a maximum tolerated decline of 3 percentage points; the North Star has already been reached before this prompt, so it cannot diagnose harm caused afterwards.

Also compare 7-day return between the assigned arms. More second connections alone does not establish that more sources cause retention. A clear connection lift with no material retention loss supports shipping the ask; a retention lift as well supports the causal product hypothesis, subject to the prompt potentially affecting return directly. At this volume, a wide retention interval means we need more evidence, not that retention is unchanged.

No clear connection lift means this particular prompt or timing did not persuade users. It does not prove the correlation is confounded or that no one wants a second source. I would inspect refusal reasons and the uncertainty before choosing a different prompt or returning focus to the first-source experience.
