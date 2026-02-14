interface NavItem {
  href: `#${string}`;
  label: string;
}

interface Step {
  description: string;
  title: string;
}

interface Principle {
  description: string;
  title: string;
}

interface FaqItem {
  answer: string;
  question: string;
}

interface SiteConfig {
  brand: string;
  description: string;
  discordUrl: string;
  docsUrl: string;
  faq: FaqItem[];
  footerLinks: { href: string; label: string }[];
  hero: {
    chips: string[];
    eyebrow: string;
    subtitle: string;
    title: string;
  };
  launchNote: string;
  mvpItems: string[];
  navItems: NavItem[];
  principles: Principle[];
  steps: Step[];
  waitlistUrl: string;
  whyPoints: string[];
}

const FALLBACK_WAITLIST_URL = "https://superimpress.com/waitlist";

const getWaitlistUrl = (): string => {
  const rawUrl = process.env.NEXT_PUBLIC_WAITLIST_URL;

  if (!rawUrl) {
    return FALLBACK_WAITLIST_URL;
  }

  try {
    const parsed = new URL(rawUrl);
    return parsed.toString();
  } catch {
    return FALLBACK_WAITLIST_URL;
  }
};

export const siteConfig: SiteConfig = {
  brand: "SuperImpress",
  description:
    "Human-first LinkedIn writing and scheduling, without the clutter of traditional growth tools.",
  discordUrl: "https://discord.gg/DWAVqksVtx",
  docsUrl: "https://docs.superimpress.com",
  faq: [
    {
      answer:
        "SuperImpress is in early access. You can join the waitlist today and we will invite people in batches.",
      question: "Is SuperImpress live right now?",
    },
    {
      answer:
        "The current MVP focuses on LinkedIn so we can keep the experience simple and reliable.",
      question: "Which platforms are supported today?",
    },
    {
      answer:
        "Yes. You can still draft and organize your posts, and mark them as published manually when needed.",
      question: "Can I use it without connecting social accounts?",
    },
  ],
  footerLinks: [
    { href: "https://app.superimpress.com", label: "App" },
    { href: "https://docs.superimpress.com", label: "Docs" },
    { href: "https://discord.gg/DWAVqksVtx", label: "Discord" },
  ],
  hero: {
    chips: ["Author-first", "LinkedIn scheduling", "Minimal interface"],
    eyebrow: "Early Access",
    subtitle:
      "Write in your own voice, save drafts quickly, and schedule without wrestling with bloated workflows.",
    title:
      "Write consistently on LinkedIn with a tool that stays out of your way.",
  },
  launchNote: "Limited early-access seats open in small batches.",
  mvpItems: ["Create a post", "Save a post", "Schedule to LinkedIn"],
  navItems: [
    { href: "#why", label: "Why" },
    { href: "#how", label: "How" },
    { href: "#mvp", label: "MVP" },
    { href: "#faq", label: "FAQ" },
  ],
  principles: [
    {
      description:
        "You write first. AI should help refine your voice, not replace it.",
      title: "Author first, AI second",
    },
    {
      description:
        "Every screen and workflow is designed for clarity, not feature sprawl.",
      title: "Minimal by design",
    },
    {
      description:
        "Publish directly or track manually. Keep your workflow private and flexible.",
      title: "Flexible publishing",
    },
  ],
  steps: [
    {
      description:
        "Capture ideas and drafts with a straightforward editor focused on writing flow.",
      title: "Write",
    },
    {
      description:
        "Queue posts for LinkedIn with a simple schedule, no unnecessary setup.",
      title: "Schedule",
    },
    {
      description:
        "Publish through supported flows or mark a post as published and track the live link manually.",
      title: "Publish / Track",
    },
  ],
  waitlistUrl: getWaitlistUrl(),
  whyPoints: [
    "Most LinkedIn tools are overcomplicated and distracting.",
    "AI-first flows often push generic, inauthentic writing.",
    "Consistency drops when posting takes too many steps.",
  ],
};
