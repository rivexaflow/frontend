import Link from "next/link";

const linkClass =
  "text-[15px] font-medium leading-snug text-slate-600 underline-offset-2 transition-colors hover:text-slate-900 dark:text-slate-300 dark:hover:text-white sm:text-base";

type Col = { title: string; links: Array<{ label: string; href: string }> };

const COLUMNS: Col[] = [
  {
    title: "Pages",
    links: [
      { label: "Home", href: "/" },
      { label: "About", href: "/about" },
      { label: "Pricing", href: "/pricing" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    title: "Socials",
    links: [
      { label: "LinkedIn", href: "https://www.linkedin.com" },
      { label: "Twitter / X", href: "https://twitter.com" },
      { label: "GitHub", href: "https://github.com" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", href: "#" },
      { label: "Terms of Service", href: "#" },
      { label: "Cookie Policy", href: "#" },
    ],
  },
  {
    title: "Register",
    links: [
      { label: "Sign Up", href: "/signup" },
      { label: "Login", href: "/login" },
      { label: "Forgot Password", href: "/forgot-password" },
    ],
  },
];

export function MarketingFooter() {
  return (
    <footer className="relative mt-0 overflow-hidden bg-white pb-6 pt-0 dark:bg-slate-950">
      <div className="relative z-10 mx-auto w-full max-w-7xl px-6 pb-28 pt-6 sm:px-8 sm:pb-32 sm:pt-8 lg:pb-36">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-5 lg:gap-8">
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2.5">
              <span
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-[#2277FF] to-[#6366f1] font-heading text-sm font-bold text-white shadow-sm"
                aria-hidden
              >
                R
              </span>
              <span className="font-heading text-xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-2xl">
                RIVEXAFLOW
              </span>
            </div>
            <p className="mt-4 max-w-xs text-[15px] leading-relaxed text-slate-600 dark:text-slate-400 sm:text-base">
              © {new Date().getFullYear()} Rivexaflow. All rights reserved.
            </p>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.title}>
              <p className="font-heading text-base font-bold uppercase tracking-[0.07em] text-slate-900 dark:text-white sm:text-[1.0625rem]">
                {col.title}
              </p>
              <ul className="mt-3 space-y-2.5 sm:mt-4 sm:space-y-3">
                {col.links.map((item) => {
                  const external = /^https?:\/\//i.test(item.href);
                  return (
                    <li key={item.label}>
                      <Link
                        href={item.href}
                        className={linkClass}
                        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                      >
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Gradient wordmark — spans full width (spacing adjusted), cropped at bottom like ref */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 z-0 overflow-hidden opacity-[0.5] [-webkit-mask-image:linear-gradient(to_top,black_72%,transparent_100%)] [mask-image:linear-gradient(to_top,black_72%,transparent_100%)] dark:opacity-[0.2]"
        aria-hidden
      >
        <svg
          role="presentation"
          className="h-auto w-full translate-y-[8%] sm:translate-y-[12%] md:translate-y-[15%]"
          viewBox="0 0 1000 118"
          preserveAspectRatio="xMidYMid meet"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="footerRvxGrad" x1="0%" y1="50%" x2="100%" y2="50%">
              <stop offset="0%" stopColor="#93c5fd" />
              <stop offset="45%" stopColor="#a5b4fc" />
              <stop offset="100%" stopColor="#e9d5ff" />
            </linearGradient>
          </defs>
          <text
            fill="url(#footerRvxGrad)"
            style={{
              fontFamily: "var(--font-heading), ui-sans-serif, system-ui, sans-serif",
            }}
            x="500"
            y="78"
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="118"
            fontWeight="700"
            letterSpacing="-22"
            textLength="964"
            lengthAdjust="spacing"
          >
            RIVEXAFLOW
          </text>
        </svg>
      </div>
    </footer>
  );
}
