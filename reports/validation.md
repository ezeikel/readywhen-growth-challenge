# Validation

Checked locally on 30 September 2026 with Argent in Brave, using the mock connections supplied by this exercise.

| Check | Observed result |
|---|---|
| Control: sign-up, profile, explainer, tools, pain, Gmail consent, board button | Reaches `/inbox`; `connector.connected` precedes `inbox.viewed`, with `via=chat_cta` and one source |
| Consent cancellation | Emits `connector.consent_cancelled`; connected sources remain empty |
| Back from the tools step | Emits `welcome.step_left` with duration and last action, then `welcome.step_back` |
| Promise-first: sign-up, typed promise, preview, Calendar consent | Skips the welcome questionnaire and reaches the connected board with `via=start` |
| Preview before connecting | Emits `promise.board_previewed`; does not emit `inbox.viewed` or count as activation |
| `/inbox?board=fail` | One automatic retry, then a failure message and Retry button; sources remain connected |
| Manual recovery | Removing the simulated failure with `history.replaceState` and pressing Retry loads the board, with `load_attempts=3` |
| `/inbox?board=slow` | Two timed-out attempts, then a failure message and Retry button |
| Start over and arm switching | Clears the mock session; the explicit URL selects the next arm |
| Narrow viewport, 387 × 840 | Promise-first through Gmail to the board passes with no horizontal overflow; control profile fields and role picker remain usable |
| Production build and TypeScript | `npm run build` and `npx tsc --noEmit` pass |

The role picker stays controlled from its first render, avoiding its previous React warning. There were no runtime errors in the inspected console log. Development-only image dimension warnings remain; no visible distortion was observed.

## Measurement boundary

The exercise intentionally logs events to the console. It does not collect cohorts, implement real OAuth or enforce a production 50/50 allocation. The preview draft is a fixed template and board commitments are seeded. Forecasts in the reports are hypotheses, not measured lifts.

Production funnel and seven-day return analysis need identity, timestamps and session context in the analytics provider's event envelope. These should not become high-cardinality tags in `recordBusinessEvent`. `recordOnce` deduplicates within this loaded mock; production repeat-session tracking and reliable exit delivery need the provider's lifecycle handling.
