# Task 3

## What I believe

A founder of a 1 to 10 person service business does not feel the product when they name their company and pick tools. They feel it when they see a promise they already made to a client, and a draft of the reply. The control, after Task 2, still interviews them and only then asks for one source. I think that order is the thing in the way.

The arm is `promise-first`. After sign-up they get one question: what did you last tell a client you'd do? That sentence goes on the board, with a draft, and only then do we ask for Gmail (Calendar if they choose it). There is no org name, no role, no explainer, no tools grid, no "what is slowing you down".

`?first-session=promise-first` on `/signup`. `?first-session=control`, or no parameter, is the Task 2 funnel. The choice sticks for the tab. Start over clears it.

I did not fold the Gmail scope into "Continue with Google". That would move connect by hiding the ask, and the first time a founder noticed, they would not trust the drafts.

The way this loses is easy to picture. They get the one draft they came for and leave without connecting. Or the empty box is more work than the old clicks, and they go before the ask. A board with their sentence on it and no source is not the North Star. I am counting it as a loss.

## The metric

Primary metric: the share of sign-ups who, in session 1, emit `connector.connected` with `is_first=1` and then `inbox.viewed`.

Session 1 starts at `signup.completed` and ends after 30 minutes with no further event from that browser. `promise.board_previewed` is not a board landing. `inbox.viewed` with `connected_count=0` does not count. The arm tag is `experiment.exposed` with `variant`.

The control rate, if the Task 2 targets hold, is:

0.92 × 0.80 × 0.95 × 0.38 × 0.86 = 0.2285

About **23% of sign-ups**, 57 people a week at 250 sign-ups. If Task 2 undershoots, control might be closer to 20%, or to today's 14.5%. The win line below is a gap in points, so it still applies.

**It won if the variant is at least 8 percentage points above the control, and the two-sided 95% interval on that gap excludes 0.** On a 23% control that is about 31%, roughly 78 people a week against 57.

## Guardrails

Read at the same time as the primary metric.

1. Sign-up to first connect, whether or not they reach the board, stays within 5 points of the control. The Task 2 chain puts that control rate at 0.92 × 0.80 × 0.95 × 0.38 = 26.6% of sign-ups, so the floor is about 22%. The primary metric can still rise when almost everyone who connects also reaches the board, even if fewer people connect. This guardrail stops me calling that a win.

2. Among people who hit the primary metric, the share who emit any product event in the next 7 days is not more than 5 points below the control. I do not know today's return rate. The guardrail is the gap. If we drag people onto the board and they never come back, the North Star moved and the product did not.

I would also read `start.left` and its `last_action`, and `connector.consent_cancelled` on `surface=start`. Those explain a loss. They are not a second success metric.

## Split, and how long

`traffic` on `first-session` is 0.5: half of sign-ups on the variant, half on the control, no holdout. At 250 sign-ups a week that is 125 an arm. A 90/10 split would take months to say anything at this volume. I want the read as soon as the arithmetic allows, and the arm deletes the interview, so I am not willing to ship it dark to everyone.

Two-sided test, alpha 0.05, power 80%. The normal quantiles are 1.96 and 0.84, and (1.96 + 0.84) squared is 7.84. Per arm:

n = 7.84 × (p1 × (1 - p1) + p2 × (1 - p2)) / (p2 - p1) squared

For a gap of 8 points on a 22.85% control (p2 = 30.85%):

p1 × (1 - p1) = 0.2285 × 0.7715 = 0.1763
p2 × (1 - p2) = 0.3085 × 0.6915 = 0.2133
n = 7.84 × (0.1763 + 0.2133) / 0.0064 = 477 per arm

477 / 125 = 3.8 weeks. **Run it for 4 weeks.** That is about 500 people an arm, 1,000 sign-ups.

The same 8 point gap is a bit cheaper if control is lower, because p(1 − p) is smaller away from 50%: about 443 an arm at a 20% control, about 365 at today's 14.5%. Four weeks still covers those. The duration is not sensitive to me being wrong about 23%.

What 4 weeks cannot see: a 5 point lift (23% to 28%, about 12 extra board arrivals a week) needs about 1,180 an arm, **about 10 weeks**. At 500 an arm the smallest gap this test can reliably call, using 2 × p(1 − p) at p = 0.23, is about 7.5 points. I set the win line at 8 because that is the lift the test can actually see. I will not call a smaller gap a win at week 4.

If the point estimate at week 4 is between +4 and +8 and the interval includes 0, I extend to 8 weeks. A 5 point gap is worth about 12 people a week on the board, and killing it at the minimum detectable effect would throw that away. If the point estimate is 0 or worse at week 4, I stop.

A peek at week 2 is not a stopping rule. The exception: if sign-up to connect is already about 10 points or more below the control, I stop. At 250 an arm that is about as small a hole as two weeks can show (the minimum detectable gap near a 25% rate is about 11 points). I would not stop for a 3 point dip.

## If it loses

Point estimate at or under 0 at week 4: ship nothing from the arm. Keep the Task 2 funnel.

Then I read `start.left`. If `last_action` is mostly `ask`, the empty box was the wall, and one softer prompt is worth a second try. If it is mostly `board` or `consent_cancelled`, they saw the draft and refused the mailbox. Deleting more screens will not fix that. The next experiment is the permission: Calendar only, or they forward one thread, instead of granting a mailbox to a product they opened ten minutes ago.
