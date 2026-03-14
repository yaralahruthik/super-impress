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
    subtitle: string;
    title: string;
  };
  launchNote: string;
  mvpItems: string[];
  navItems: NavItem[];
  principles: Principle[];
  steps: Step[];
  whyPoints: string[];
}

export const siteConfig: SiteConfig = {
  brand: "SuperImpress",
  description:
    "Turn any pasted content into a minimal-text carousel draft with sharp sequencing and visual cues.",
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
        "The MVP focuses on carousel generation only: paste content, generate a slide-by-slide draft, edit it, and export the copy with visualization notes.",
      question: "What does the MVP do today?",
    },
    {
      answer:
        "Yes. The first version does not require social account connections because it is focused on carousel creation, not publishing.",
      question: "Do I need to connect social accounts?",
    },
  ],
  footerLinks: [
    { href: "https://docs.superimpress.com", label: "Docs" },
    { href: "https://discord.gg/DWAVqksVtx", label: "Discord" },
  ],
  hero: {
    chips: ["Carousel-first", "Minimal text", "Visual storytelling"],
    subtitle:
      "Paste dense source content, get a cleaner 6-10 slide narrative with short copy and visualization notes.",
    title: "Turn any idea into a minimal-text carousel that feels deliberate.",
  },
  launchNote: "Limited early-access seats open in small batches.",
  mvpItems: [
    "Paste content of any length",
    "Generate up to 10 carousel slides",
    "Get text plus visualization notes",
    "Edit, reorder, and regenerate slides",
    "Copy the draft for downstream design and publishing",
  ],
  navItems: [
    { href: "#why", label: "Why" },
    { href: "#how", label: "How" },
    { href: "#mvp", label: "MVP" },
    { href: "#faq", label: "FAQ" },
  ],
  principles: [
    {
      description:
        "The source material drives the output. AI should structure and compress ideas, not fabricate them.",
      title: "Source first, AI assisted",
    },
    {
      description:
        "Each slide should earn attention with very little text and a clear role in the narrative.",
      title: "Minimal text, sharp flow",
    },
    {
      description:
        "The product stops at a strong draft so creators can keep their design and publishing workflows flexible.",
      title: "Draft, then design anywhere",
    },
  ],
  steps: [
    {
      description:
        "Paste the raw source material, whether it is a rough note, article, transcript, or long-form draft.",
      title: "Paste",
    },
    {
      description:
        "Set the audience, tone, and desired outcome so the carousel aims at the right reader response.",
      title: "Direct",
    },
    {
      description:
        "Get a structured carousel draft with short slide copy and visualization notes you can refine and export.",
      title: "Generate",
    },
  ],
  whyPoints: [
    "Turning long-form content into a good carousel still takes too many manual decisions.",
    "Most AI outputs read like stuffed captions split into slides, not actual carousel storytelling.",
    "Creators need help compressing ideas into a cleaner visual sequence, not another bloated content suite.",
  ],
};
