export type WorkspaceWebsiteMode = "none" | "hosted" | "external";

export type WorkspaceWebsitePage = {
  id: string;
  label: string;
  path: string;
  enabled: boolean;
};

export type WebsiteSectionType =
  | "hero"
  | "logo-cloud"
  | "about"
  | "features"
  | "stats"
  | "testimonials"
  | "faq"
  | "pricing"
  | "team"
  | "cta"
  | "contact"
  | "footer";

export type WebsiteFaqItem = { id: string; question: string; answer: string };
export type WebsiteTestimonial = { id: string; name: string; role: string; quote: string; avatar?: string };
export type WebsiteFeature = { id: string; title: string; description: string; icon?: string };
export type WebsiteStat = { id: string; value: string; label: string };
export type WebsitePricingPlan = { id: string; name: string; price: string; period: string; features: string[]; highlighted?: boolean };
export type WebsiteTeamMember = { id: string; name: string; role: string; photo?: string };

export type WebsiteSectionContent = {
  headline?: string;
  subheadline?: string;
  body?: string;
  ctaText?: string;
  ctaUrl?: string;
  secondaryCtaText?: string;
  secondaryCtaUrl?: string;
  imageUrl?: string;
  backgroundImageUrl?: string;
  alignment?: "left" | "center" | "right";
  logos?: string[];
  features?: WebsiteFeature[];
  stats?: WebsiteStat[];
  testimonials?: WebsiteTestimonial[];
  faq?: WebsiteFaqItem[];
  plans?: WebsitePricingPlan[];
  team?: WebsiteTeamMember[];
  email?: string;
  phone?: string;
  address?: string;
  copyright?: string;
  socialLinks?: { label: string; url: string }[];
};

export type WebsiteSection = {
  id: string;
  type: WebsiteSectionType;
  label: string;
  enabled: boolean;
  content: WebsiteSectionContent;
};

export type WorkspaceThemeConfig = {
  primaryColor: string;
  secondaryColor?: string;
  accentColor?: string;
  fontFamily?: string;
  browserTitle?: string;
  favicon?: string;
  iconLogo?: string;
  loginWelcomeTitle?: string;
  loginWelcomeMessage?: string;
  loginBackgroundUrl?: string;
  hidePoweredBy?: boolean;
  websiteMode?: WorkspaceWebsiteMode;
  websiteUrl?: string;
  websiteSubdomain?: string;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  ogImage?: string;
  metaRobots?: string;
  canonicalUrl?: string;
  twitterHandle?: string;
  websitePages?: WorkspaceWebsitePage[];
  websiteSections?: WebsiteSection[];
};

export const WEBSITE_SECTION_LABELS: Record<WebsiteSectionType, string> = {
  hero: "Hero",
  "logo-cloud": "Logo cloud",
  about: "About",
  features: "Features",
  stats: "Stats",
  testimonials: "Testimonials",
  faq: "FAQ",
  pricing: "Pricing",
  team: "Team",
  cta: "Call to action",
  contact: "Contact",
  footer: "Footer",
};

export const DEFAULT_WEBSITE_SECTIONS: WebsiteSection[] = [
  {
    id: "hero",
    type: "hero",
    label: "Hero",
    enabled: true,
    content: {
      headline: "Run your business on one powerful workspace",
      subheadline: "CRM, HRM, billing, and automation — unified for modern teams.",
      ctaText: "Get started",
      ctaUrl: "/login",
      secondaryCtaText: "Book a demo",
      secondaryCtaUrl: "/contact",
      backgroundImageUrl: "",
      alignment: "center",
    },
  },
  {
    id: "logo-cloud",
    type: "logo-cloud",
    label: "Logo cloud",
    enabled: true,
    content: {
      headline: "Trusted by growing companies",
      logos: ["Acme", "Northwind", "Globex", "Initech", "Umbrella"],
    },
  },
  {
    id: "about",
    type: "about",
    label: "About",
    enabled: true,
    content: {
      headline: "Built for operators who need clarity",
      body: "We help companies connect sales, people operations, and finance in a single branded portal your team and customers can trust.",
      imageUrl: "",
      ctaText: "Learn more",
      ctaUrl: "/about",
    },
  },
  {
    id: "features",
    type: "features",
    label: "Features",
    enabled: true,
    content: {
      headline: "Everything your company needs",
      subheadline: "Modular products that scale with your organization.",
      features: [
        { id: "f1", title: "CRM pipeline", description: "Leads, deals, dialer, and reports in one flow." },
        { id: "f2", title: "HRM suite", description: "Attendance, payroll-ready data, and employee profiles." },
        { id: "f3", title: "White-label portal", description: "Your domain, logo, theme, and public website." },
      ],
    },
  },
  {
    id: "stats",
    type: "stats",
    label: "Stats",
    enabled: true,
    content: {
      stats: [
        { id: "s1", value: "10k+", label: "Active users" },
        { id: "s2", value: "99.9%", label: "Uptime" },
        { id: "s3", value: "40+", label: "Countries" },
        { id: "s4", value: "24/7", label: "Support" },
      ],
    },
  },
  {
    id: "testimonials",
    type: "testimonials",
    label: "Testimonials",
    enabled: true,
    content: {
      headline: "What customers say",
      testimonials: [
        { id: "t1", name: "Sarah Chen", role: "COO, Northwind", quote: "We launched our branded portal in a day. Our team finally has one place to work." },
        { id: "t2", name: "Marcus Reid", role: "Head of Sales", quote: "CRM + dialer + custom domain made outbound feel enterprise-grade." },
        { id: "t3", name: "Priya Nair", role: "HR Director", quote: "Attendance and employee records are finally connected to the rest of the business." },
      ],
    },
  },
  {
    id: "faq",
    type: "faq",
    label: "FAQ",
    enabled: true,
    content: {
      headline: "Frequently asked questions",
      faq: [
        { id: "q1", question: "Can I use my own domain?", answer: "Yes. Point an A or CNAME record to connect portal.yourcompany.com." },
        { id: "q2", question: "Do you support multiple workspaces?", answer: "Each company can run multiple workspaces under one organization graph." },
        { id: "q3", question: "Can I connect an existing website?", answer: "Yes — link your external site or host pages on your subdomain." },
      ],
    },
  },
  {
    id: "pricing",
    type: "pricing",
    label: "Pricing",
    enabled: false,
    content: {
      headline: "Simple, transparent pricing",
      plans: [
        { id: "p1", name: "Starter", price: "$49", period: "/mo", features: ["CRM", "1 workspace", "Email support"] },
        { id: "p2", name: "Growth", price: "$149", period: "/mo", features: ["CRM + HRM", "5 workspaces", "Custom domain"], highlighted: true },
        { id: "p3", name: "Enterprise", price: "Custom", period: "", features: ["All modules", "SSO", "Dedicated support"] },
      ],
    },
  },
  {
    id: "team",
    type: "team",
    label: "Team",
    enabled: false,
    content: {
      headline: "Meet the team",
      team: [
        { id: "m1", name: "Alex Morgan", role: "CEO" },
        { id: "m2", name: "Jamie Lee", role: "CTO" },
        { id: "m3", name: "Riya Patel", role: "Head of Product" },
      ],
    },
  },
  {
    id: "cta",
    type: "cta",
    label: "Call to action",
    enabled: true,
    content: {
      headline: "Ready to launch your branded workspace?",
      subheadline: "Set up your logo, domain, and website in minutes.",
      ctaText: "Start free trial",
      ctaUrl: "/signup",
    },
  },
  {
    id: "contact",
    type: "contact",
    label: "Contact",
    enabled: true,
    content: {
      headline: "Contact us",
      email: "hello@company.com",
      phone: "+1 (555) 010-2000",
      address: "100 Market Street, San Francisco, CA",
    },
  },
  {
    id: "footer",
    type: "footer",
    label: "Footer",
    enabled: true,
    content: {
      copyright: "© 2026 Your Company. All rights reserved.",
      socialLinks: [
        { label: "LinkedIn", url: "https://linkedin.com" },
        { label: "Twitter", url: "https://twitter.com" },
      ],
    },
  },
];

export const DEFAULT_THEME_CONFIG: WorkspaceThemeConfig = {
  primaryColor: "#191970",
  secondaryColor: "#2277FF",
  accentColor: "#2277FF",
  fontFamily: "Inter",
  browserTitle: "",
  hidePoweredBy: false,
  websiteMode: "none",
  metaRobots: "index, follow",
  websitePages: [
    { id: "home", label: "Home", path: "/", enabled: true },
    { id: "about", label: "About", path: "/about", enabled: true },
    { id: "contact", label: "Contact", path: "/contact", enabled: true },
    { id: "careers", label: "Careers", path: "/careers", enabled: false },
  ],
  websiteSections: DEFAULT_WEBSITE_SECTIONS,
};

export const FONT_OPTIONS = ["Inter", "Roboto", "Poppins", "DM Sans", "Manrope"] as const;

export type BrandingSectionId = "identity" | "theme" | "domains" | "website" | "seo";

export const BRANDING_SECTIONS: { id: BrandingSectionId; label: string; description: string }[] = [
  { id: "identity", label: "Identity", description: "Logo, favicon, brand name" },
  { id: "theme", label: "Theme", description: "Colors and typography" },
  { id: "domains", label: "Domains", description: "Subdomain and DNS" },
  { id: "website", label: "Website", description: "Page builder and structure" },
  { id: "seo", label: "SEO & meta", description: "Search and social tags" },
];

function parseWebsiteSections(raw: unknown): WebsiteSection[] {
  if (!Array.isArray(raw) || raw.length === 0) return DEFAULT_WEBSITE_SECTIONS;
  const defaultsByType = Object.fromEntries(DEFAULT_WEBSITE_SECTIONS.map((s) => [s.type, s]));
  return raw
    .filter((item): item is WebsiteSection => Boolean(item && typeof item === "object" && "type" in item))
    .map((item) => {
      const typed = item as WebsiteSection;
      const fallback = defaultsByType[typed.type] ?? DEFAULT_WEBSITE_SECTIONS[0];
      return {
        id: String(typed.id || fallback.id),
        type: typed.type,
        label: String(typed.label || WEBSITE_SECTION_LABELS[typed.type] || fallback.label),
        enabled: typed.enabled !== false,
        content: { ...fallback.content, ...(typed.content || {}) },
      };
    });
}

export function parseThemeConfig(raw: unknown): WorkspaceThemeConfig {
  const base = { ...DEFAULT_THEME_CONFIG, websiteSections: [...DEFAULT_WEBSITE_SECTIONS] };
  if (!raw || typeof raw !== "object") return base;
  const obj = raw as Record<string, unknown>;
  return {
    ...base,
    primaryColor: typeof obj.primaryColor === "string" ? obj.primaryColor : base.primaryColor,
    secondaryColor: typeof obj.secondaryColor === "string" ? obj.secondaryColor : base.secondaryColor,
    accentColor: typeof obj.accentColor === "string" ? obj.accentColor : base.accentColor,
    fontFamily: typeof obj.fontFamily === "string" ? obj.fontFamily : base.fontFamily,
    browserTitle: typeof obj.browserTitle === "string" ? obj.browserTitle : "",
    favicon: typeof obj.favicon === "string" ? obj.favicon : "",
    iconLogo: typeof obj.iconLogo === "string" ? obj.iconLogo : "",
    loginWelcomeTitle: typeof obj.loginWelcomeTitle === "string" ? obj.loginWelcomeTitle : "",
    loginWelcomeMessage: typeof obj.loginWelcomeMessage === "string" ? obj.loginWelcomeMessage : "",
    loginBackgroundUrl: typeof obj.loginBackgroundUrl === "string" ? obj.loginBackgroundUrl : "",
    hidePoweredBy: Boolean(obj.hidePoweredBy),
    websiteMode:
      obj.websiteMode === "hosted" || obj.websiteMode === "external" || obj.websiteMode === "none"
        ? obj.websiteMode
        : "none",
    websiteUrl: typeof obj.websiteUrl === "string" ? obj.websiteUrl : "",
    websiteSubdomain: typeof obj.websiteSubdomain === "string" ? obj.websiteSubdomain : "",
    metaTitle: typeof obj.metaTitle === "string" ? obj.metaTitle : "",
    metaDescription: typeof obj.metaDescription === "string" ? obj.metaDescription : "",
    metaKeywords: typeof obj.metaKeywords === "string" ? obj.metaKeywords : "",
    ogImage: typeof obj.ogImage === "string" ? obj.ogImage : "",
    metaRobots: typeof obj.metaRobots === "string" ? obj.metaRobots : base.metaRobots,
    canonicalUrl: typeof obj.canonicalUrl === "string" ? obj.canonicalUrl : "",
    twitterHandle: typeof obj.twitterHandle === "string" ? obj.twitterHandle : "",
    websitePages: Array.isArray(obj.websitePages)
      ? obj.websitePages
          .filter((p): p is WorkspaceWebsitePage => Boolean(p && typeof p === "object" && "id" in p))
          .map((p) => ({
            id: String((p as WorkspaceWebsitePage).id),
            label: String((p as WorkspaceWebsitePage).label ?? ""),
            path: String((p as WorkspaceWebsitePage).path ?? "/"),
            enabled: Boolean((p as WorkspaceWebsitePage).enabled),
          }))
      : base.websitePages,
    websiteSections: parseWebsiteSections(obj.websiteSections),
  };
}

export type CompanyBrandingPayload = {
  brandName: string | null;
  logo: string | null;
  customDomain: string | null;
  themeConfig: WorkspaceThemeConfig;
};
