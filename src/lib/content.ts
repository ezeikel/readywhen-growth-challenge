/**
 * Every string and every list the mock funnel renders. One home, so a growth
 * experiment is a copy edit here rather than a hunt through five screens.
 * Copy is taken from the live product so the funnel reads like the real thing.
 */

// ── Sign-in ────────────────────────────────────────────────────────────────
export const SOCIAL_PROVIDERS = [
  { id: "google", label: "Continue with Google", iconSrc: "/icons/google.svg" },
  { id: "microsoft", label: "Continue with Microsoft", iconSrc: "/icons/outlook.svg" },
] as const;

// ── Step 2: the sign-up survey ─────────────────────────────────────────────
export const SURVEY_FIELDS = [
  {
    key: "headcount",
    label: "Company headcount",
    options: ["1–10", "11–50", "51–200", "201–500", "501–1,000", "1,001–5,000", "5,000+"],
  },
  {
    key: "role",
    label: "Your role",
    options: [
      "Individual contributor",
      "Freelancer",
      "Solo business owner",
      "Executive",
      "Manager",
      "Other",
    ],
  },
  {
    key: "department",
    label: "Department",
    options: [
      "Executive",
      "Revenue",
      "Operations",
      "Product",
      "Marketing",
      "Sales",
      "Customer Success",
      "People/HR",
      "Finance",
      "IT",
      "Other",
    ],
  },
  {
    key: "referral",
    label: "How did you hear about us?",
    options: [
      "Friend or colleague",
      "Social media",
      "Online search",
      "AI search",
      "Newsletter or community",
      "Podcast or event",
      "Other",
    ],
  },
] as const;

// ── Step 3: the capability explainer ───────────────────────────────────────
export const EXPLAINER_SCREENS = [
  {
    id: "scan",
    headline: "First, it scans everything.",
    sub: "Email, calendar, meetings, chat.",
    cta: "See what it catches",
  },
  {
    id: "capture",
    headline: "It catches every promise.",
    sub: "Turned into one clear task.",
    cta: "See how it closes",
  },
  {
    id: "close",
    headline: "Then it brings it back done.",
    sub: "It drafts the reply. You just approve.",
    cta: "Pick your tools",
  },
] as const;

// ── Step 4: where does your work happen ────────────────────────────────────
export interface Tool {
  slug: string;
  name: string;
  iconSrc: string;
}

export const WORK_TOOLS: readonly Tool[] = [
  { slug: "slack", name: "Slack", iconSrc: "/icons/slack.svg" },
  { slug: "gmail", name: "Gmail", iconSrc: "/icons/gmail.svg" },
  { slug: "notion", name: "Notion", iconSrc: "/icons/notion.svg" },
  { slug: "granola", name: "Granola", iconSrc: "/icons/granola.svg" },
  { slug: "calendar", name: "Calendar", iconSrc: "/icons/google-calendar.svg" },
  { slug: "meet", name: "Meet", iconSrc: "/icons/google-meet.svg" },
  { slug: "hubspot", name: "HubSpot", iconSrc: "/icons/hubspot.png" },
  { slug: "google-drive", name: "Google Drive", iconSrc: "/icons/google-drive.svg" },
  { slug: "salesforce", name: "Salesforce", iconSrc: "/icons/salesforce.svg" },
  { slug: "fathom", name: "Fathom", iconSrc: "/icons/fathom.svg" },
  { slug: "teams", name: "Teams", iconSrc: "/icons/microsoft-teams.svg" },
  { slug: "jira", name: "Jira", iconSrc: "/icons/jira.svg" },
];

const BY_SLUG = new Map(WORK_TOOLS.map((tool) => [tool.slug, tool]));

export function toolBySlug(slug: string): Tool | undefined {
  return BY_SLUG.get(slug);
}

// ── Step 5: what is slowing you down ───────────────────────────────────────
export const JTBD_OPTIONS = [
  { slug: "slow-to-get-back-to-clients", title: "Client emails are piling up" },
  { slug: "things-fall-through-cracks", title: "Things fall through the cracks" },
  { slug: "no-time-to-chase-new-business", title: "I don't have time to chase new business" },
  { slug: "work-stuck-waiting-on-someone", title: "Work gets stuck waiting on someone else" },
  { slug: "juggling-multiple-businesses", title: "I'm juggling more than one business" },
] as const;

/** The agent's opening line, tuned to the pain the user picked. */
export function openingLine(jtbd: string | null, firstName: string | null): string {
  const hi = firstName ? `Hey ${firstName}, great to see you. ` : "Hi 👋 ";
  switch (jtbd) {
    case "slow-to-get-back-to-clients":
      return `${hi}I help you keep clients feeling looked after. Let's check whether there are any replies you're behind on, and close them now.`;
    case "things-fall-through-cracks":
      return `${hi}I help you keep on top of everything you've committed to. Let's check whether there are any forgotten commitments, and close them now.`;
    case "no-time-to-chase-new-business":
      return `${hi}I help you keep new business moving. Let's check whether there are any leads gone cold, and follow up now.`;
    case "work-stuck-waiting-on-someone":
      return `${hi}I help you keep work moving, even when it's stuck on someone else. Let's check who you're waiting on, and nudge them now.`;
    case "juggling-multiple-businesses":
      return `${hi}I help you hold more than one business at once without dropping any of them. Let's start with what's slipping.`;
    default:
      return "Hi 👋 I keep track of the things you said you'd do: I find the commitments buried in your meetings, Slack and email, draft your follow-ups, and make sure nothing slips.";
  }
}

// ── The 2nd Brain (pre-reveal: the count is running, nothing shown yet) ────
export const BRAIN_TITLE = "2nd Brain";
export const BRAIN_SUBTITLE =
  "takes what used to live in your head and scattered across your tools, and files it into folders that stay up to date.";

/** Working days from "I can see your work" to the reveal. */
export const WORKING_DAYS_TO_UNLOCK = 5;

export const COUNTDOWN_DESCRIPTION = "until I show you what I've learned about your business.";
export const COUNTDOWN_FOOTNOTE = "I'm reading your work from today.";

export function countdownUnit(days: number): string {
  return days === 1 ? "working day" : "working days";
}

export const CONTEXT_HEADING = "Three things that help me most";
export const CONTEXT_HINT = "Optional. You can change any of it any time.";
export const CONTEXT_SAVE = "Save";

/** The three questions, in the order they are asked. */
export const QUESTIONS = [
  {
    key: "business",
    label: "What does your business do?",
    placeholder: "The one-liner you'd give someone new. What you sell, and who buys it.",
  },
  {
    key: "priorities",
    label: "What are your priorities to keep your business running?",
    placeholder: "Day to day, and the bigger thing you're driving this quarter.",
  },
  {
    key: "people",
    label: "Who do you work with most?",
    placeholder: "Names help. Your team, your customers, anyone you can't drop the ball on.",
  },
] as const;

export const LEARNING_HEADING = "Still getting to know you";

/** What each locked section will hold once it unlocks. Each row is a promise
 *  that has to be kept on day five, so the list stays short and concrete. */
export const LOCKED_SECTIONS = [
  {
    key: "voice",
    name: "Your voice",
    waiting: "How you write, so the drafts I hand you already sound like you",
  },
  {
    key: "clients",
    name: "Your clients & deals",
    waiting: "Who you work with, and the deals and projects on your plate",
  },
  {
    key: "rhythm",
    name: "How you work",
    waiting: "Your goals, your priorities, and where your time actually goes",
  },
] as const;

export const CONNECT_MORE_HEADING = "Give your 2nd Brain more context";
export const CONNECT_MORE_LINE =
  "Every tool you connect makes me sharper. I only read what I need.";

// ── Chat ───────────────────────────────────────────────────────────────────
export const CONNECTORS: readonly Tool[] = WORK_TOOLS.filter((tool) =>
  ["gmail", "slack", "calendar", "notion"].includes(tool.slug),
);

export const FOUND_COMMITMENTS = [
  {
    title: "Send Tom the invoice for June",
    due: "due Friday",
    source: "Gmail",
    iconSrc: "/icons/gmail.svg",
    quote: "\"Could you send over the invoice for June? Want to get it paid this week.\"",
  },
  {
    title: "Share the pricing deck with Rin",
    due: "due today",
    source: "Slack",
    iconSrc: "/icons/slack.svg",
    quote: "\"Can you drop me the latest pricing deck before the Acme call?\"",
  },
  {
    title: "Follow up with Acme after Tuesday's call",
    due: "overdue by 2 days",
    source: "Calendar",
    iconSrc: "/icons/google-calendar.svg",
    quote: "\"I'll come back to you with next steps by end of week.\"",
  },
];

export const DRAFT_REPLY = {
  to: "Tom Blake",
  subject: "Re: June invoice",
  body: "Hi Tom.\n\nThanks, glad last month went well. June invoice attached, due in 14 days. Shout if anything is unclear.\n\nBest,",
};

/** Canned answers, cycled in order. A demo, not a model. */
export const CANNED_REPLIES = [
  "I've had a look across your connected tools. Nothing new has slipped since this morning — you're clear.",
  "Drafted. It's waiting for your approval above; edit anything you'd say differently and I'll learn it.",
  "I can set that up as a routine so it runs every Monday at 8am and lands in your inbox. Want me to?",
  "That's now in your 2nd Brain, so I'll apply it to everything I draft from here on.",
];
