# Task 2

250 sign-ups a week. Each row in `data/funnel.md` is the share of the people who reached the previous step. Chained, before rounding:

0.85 × 0.80 × 0.95 × 0.30 × 0.75 = 0.14535

That is **36 people a week** on the board. The "15%" in the funnel note is that figure rounded, which would be 38. I use 36 so the deltas below add up. I use the funnel's 30% connect rate throughout this report.

Where the week goes, out of 250:

| Step | In | Out | Lost |
|---|---:|---:|---:|
| Name + survey, 85% | 250 | 213 | 37 |
| Picks tools, 80% | 213 | 170 | 43 |
| What is slowing them down, 95% | 170 | 162 | 8 |
| Connects a source, 30% | 162 | 48 | 113 |
| Lands on the board, 75% | 48 | 36 | 12 |

The North Star is a connected source and the board, both in the first session. Connect is the hole: 113 of the 162 people who arrive there leave. The board then loses 12 people who have already handed over a source. Those 12 are the most expensive miss, because the hard part is already done.

I left the 2nd Brain alone. It takes about a week to generate, and the user does not do it.

The tools step loses more people than the survey (43 against 37). It is a weaker lever on the North Star, because anyone it saves still has to clear connect at 30%. Eight extra points there, 80% to 88%, is about 4 more board arrivals a week. Eight extra points on connect is about 10. The explainer sits between the survey and the tools in this mock and is not its own row in the funnel, so I did not treat it as a measured step. The screen events from Task 1 are how I would check it.

## What I changed

Three changes to the default funnel. These are planning estimates. I have not run them, and I have not spoken to users.

### Connect, 30% to 38%

The chat offered Gmail, Slack, Calendar and Notion as equals, then a consent dialog that led with reading messages, creating drafts, and seeing who you write to. The ICP works from email, calendar and meetings. Slack and Notion are a guess for a lot of them.

The screen now asks for one source. Gmail, unless they said work is stuck waiting on someone else, in which case Calendar. The sentence matches the pain they just picked. The consent screen states the limit: the last 30 days, drafts they approve, nothing sent, deleted or shared. The other tools sit behind "Use a different tool".

38% is 8 of the 70 points who leave, roughly a quarter of them. That is the group I think stall on a four-way choice or on a scope list with no limit. It leaves the people who will not grant a mailbox to a product they have just met. If `connector.consent_cancelled` is most of the drop, 8 points is too high, and the next job is the permission itself.

On its own: 36.3 board arrivals a week becomes 46.0, **plus 9.7**.

### Board, 75% to 86%

A quarter of connectors never land on the board. Two things cause that, and this change handles both.

The first is navigation. Connecting used to end on a sentence that pointed at the sidebar. The next action is now a button, "Open your board".

The second is the board failing to load. The page used to render the board or nothing. It now shows a loading state, and a load that errors or passes 8 seconds is retried once, automatically, after a short backoff. If that fails too, the page says so and offers Retry, instead of leaving someone who has just handed over a mailbox in front of a blank screen. `inbox.load_failed` and `inbox.load_retried` record every failure and retry, with the attempt and whether it was a timeout.

86% recovers 11 of the 25 missing points. The split I am assuming, which the events have to check: about 15 points never navigate, about 10 hit a failed load. The button recovers about 7 of the 15. Some of those people were never going to look that day. The automatic retry and the Retry button recover about 4 of the 10, the transient failures. A board that fails every time still loses them, and that is an engineering fix, not a UI one. If `inbox.load_failed` with `attempt` 2 or higher is a large share of connectors, the retry is not enough and the load itself is the job.

On its own, holding connect at 30%: 36.3 becomes 41.7, **plus 5.3**.

### Name + survey, 85% to 92%

Continue was blocked on a first name and four dropdowns: headcount up to 5,000+, department, role, and how you heard about us. Headcount and department tell a three-person studio that the product is built for a company with departments. Referral is attribution. None of them change the first board.

The step is now the name, with last name still optional, and role. I moved "Solo business owner" and "Freelancer" to the top of that list so the ICP is not underneath "Individual contributor". The reorder is not in the 7 points. The 7 points are the three fields removed. I stopped at 92% rather than 95% because a name and one question still lose people. Cutting the whole step is a different change. I kept the name because the agent speaks it.

On its own: 36.3 becomes 39.3, **plus 3.0**.

## Together

If the three lifts are independent:

0.92 × 0.80 × 0.95 × 0.38 × 0.86 = 0.2285

That is **57 people a week** on the board, plus 21 on the baseline of 36.

I would not plan headcount on 57. The survey lift and the board lift are the ones I am most likely to have overstated, and the people a shorter form saves may be the least willing to connect. The number I would actually plan on is **50 a week, plus 14**. That keeps the full connect lift (30% to 38%) and takes half of the other two (survey 85% to 88%, board 75% to 80%):

0.88 × 0.80 × 0.95 × 0.38 × 0.80 = 0.203

51 a week. I will call that 50.

## What would prove this wrong

- Connect still at or under 34% after two weeks on the new screen. Then 38% was wrong. Read `connector.others_opened`, `connector.picked`, `connector.consent_cancelled` and `connector.connected` before changing the screen again.
- `inbox.opened_from_chat` with no following `inbox.viewed`, and no `inbox.load_failed`. The button is not the leak.
- `inbox.load_failed` at `attempt` 2 for more than a few percent of connectors. The retry is not enough, and the load itself needs fixing.
- Profile `welcome.step_left` still clustering on `first_name` or `survey_role`. Removing the other fields did not move the step, and the name is the remaining wall.
