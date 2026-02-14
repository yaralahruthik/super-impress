import { Reveal } from "@/components/reveal";
import { siteConfig } from "@/lib/site-config";

const externalLinkProps = {
  rel: "noopener noreferrer",
  target: "_blank",
} as const;

const sectionPadding = "site-section";

export default function Home() {
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 border-border/70 border-b bg-background/88 backdrop-blur">
        <div className="site-container flex min-h-16 items-center justify-between gap-4 py-3">
          <a
            className="font-display font-semibold text-2xl tracking-tight"
            href="#top"
          >
            {siteConfig.brand}
          </a>
          <nav
            aria-label="Primary navigation"
            className="hidden items-center gap-6 sm:flex"
          >
            {siteConfig.navItems.map((item) => (
              <a className="nav-link" href={item.href} key={item.href}>
                {item.label}
              </a>
            ))}
          </nav>
          <a
            className="btn btn-primary text-sm"
            href={siteConfig.waitlistUrl}
            {...externalLinkProps}
          >
            Get Early Access
          </a>
        </div>
      </header>

      <main id="top">
        <section className={`${sectionPadding} pt-20 sm:pt-24`}>
          <div className="site-container">
            <Reveal>
              <p className="eyebrow">{siteConfig.hero.eyebrow}</p>
            </Reveal>
            <Reveal delay={0.04}>
              <h1 className="hero-title mt-3 max-w-4xl">
                {siteConfig.hero.title}
              </h1>
            </Reveal>
            <Reveal delay={0.08}>
              <p className="muted-text mt-6 max-w-2xl text-lg leading-relaxed">
                {siteConfig.hero.subtitle}
              </p>
            </Reveal>
            <Reveal delay={0.12}>
              <div className="mt-9 flex flex-wrap items-center gap-3">
                <a
                  className="btn btn-primary"
                  href={siteConfig.waitlistUrl}
                  {...externalLinkProps}
                >
                  Get Early Access
                </a>
                <a
                  className="btn btn-ghost"
                  href={siteConfig.docsUrl}
                  {...externalLinkProps}
                >
                  Read Docs
                </a>
              </div>
            </Reveal>
            <Reveal delay={0.16}>
              <ul className="mt-8 flex flex-wrap gap-2">
                {siteConfig.hero.chips.map((chip) => (
                  <li className="chip" key={chip}>
                    {chip}
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
        </section>

        <section className={sectionPadding} id="why">
          <div className="site-container">
            <Reveal>
              <p className="eyebrow">Why SuperImpress</p>
              <h2 className="section-title mt-3 max-w-2xl">
                For LinkedIn creators who want consistency without noise.
              </h2>
            </Reveal>
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {siteConfig.whyPoints.map((point, index) => (
                <Reveal delay={0.04 * (index + 1)} key={point}>
                  <article className="surface-card h-full p-6">
                    <p className="muted-text leading-relaxed">{point}</p>
                  </article>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section className={sectionPadding} id="how">
          <div className="site-container">
            <Reveal>
              <p className="eyebrow">How It Works</p>
              <h2 className="section-title mt-3 max-w-2xl">
                A straightforward path from draft to published post.
              </h2>
            </Reveal>
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {siteConfig.steps.map((step, index) => (
                <Reveal delay={0.04 * (index + 1)} key={step.title}>
                  <article className="surface-card h-full p-6">
                    <p className="eyebrow">{`Step ${index + 1}`}</p>
                    <h3 className="mt-2 font-display font-semibold text-2xl">
                      {step.title}
                    </h3>
                    <p className="muted-text mt-3 leading-relaxed">
                      {step.description}
                    </p>
                  </article>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section className={sectionPadding} id="mvp">
          <div className="site-container">
            <Reveal>
              <p className="eyebrow">MVP Today</p>
              <h2 className="section-title mt-3 max-w-2xl">
                Focused scope. Useful from day one.
              </h2>
            </Reveal>
            <Reveal delay={0.08}>
              <ul className="surface-card mt-8 space-y-3 p-6 sm:p-8">
                {siteConfig.mvpItems.map((item) => (
                  <li className="flex items-start gap-3 text-lg" key={item}>
                    <span aria-hidden className="mt-1 text-accent">
                      ●
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
        </section>

        <section className={sectionPadding}>
          <div className="site-container">
            <Reveal>
              <p className="eyebrow">Principles</p>
              <h2 className="section-title mt-3 max-w-2xl">
                Product choices grounded in real writing workflows.
              </h2>
            </Reveal>
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {siteConfig.principles.map((item, index) => (
                <Reveal delay={0.05 * (index + 1)} key={item.title}>
                  <article className="surface-card h-full p-6">
                    <h3 className="font-display font-semibold text-2xl">
                      {item.title}
                    </h3>
                    <p className="muted-text mt-3 leading-relaxed">
                      {item.description}
                    </p>
                  </article>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section className={sectionPadding} id="faq">
          <div className="site-container">
            <Reveal>
              <p className="eyebrow">FAQ</p>
              <h2 className="section-title mt-3 max-w-2xl">
                Short answers before you join early access.
              </h2>
            </Reveal>
            <div className="mt-8 space-y-4">
              {siteConfig.faq.map((item, index) => (
                <Reveal delay={0.04 * (index + 1)} key={item.question}>
                  <article className="surface-card p-6">
                    <h3 className="font-semibold text-lg">{item.question}</h3>
                    <p className="muted-text mt-2 leading-relaxed">
                      {item.answer}
                    </p>
                  </article>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section className={`${sectionPadding} pb-14`}>
          <div className="site-container">
            <Reveal>
              <div className="surface-card p-7 sm:p-10">
                <p className="eyebrow">Early Access</p>
                <h2 className="section-title mt-3 max-w-2xl">
                  Build your LinkedIn writing habit with a lighter workflow.
                </h2>
                <p className="muted-text mt-4 max-w-2xl text-lg">
                  {siteConfig.launchNote}
                </p>
                <div className="mt-7 flex flex-wrap items-center gap-3">
                  <a
                    className="btn btn-primary"
                    href={siteConfig.waitlistUrl}
                    {...externalLinkProps}
                  >
                    Get Early Access
                  </a>
                  <a
                    className="text-link"
                    href={siteConfig.docsUrl}
                    {...externalLinkProps}
                  >
                    Docs
                  </a>
                  <a
                    className="text-link"
                    href={siteConfig.discordUrl}
                    {...externalLinkProps}
                  >
                    Discord
                  </a>
                </div>
              </div>
            </Reveal>
          </div>
        </section>
      </main>

      <footer className="border-border/70 border-t py-7">
        <div className="site-container flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="muted-text text-sm">{siteConfig.description}</p>
          <ul className="flex flex-wrap items-center gap-4">
            {siteConfig.footerLinks.map((link) => (
              <li key={link.href}>
                <a className="nav-link" href={link.href} {...externalLinkProps}>
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </footer>
    </div>
  );
}
