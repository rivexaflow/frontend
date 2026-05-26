export type MarketingNavLink = {
  label: string;
  href: string;
  description?: string;
};

export type MarketingNavColumn = {
  title: string;
  items: MarketingNavLink[];
};

export type MarketingNavMega = {
  type: "mega";
  label: string;
  href: string;
  panelTitle: string;
  panelCta: string;
  columns: MarketingNavColumn[];
};

export type MarketingNavItem =
  | {
      type: "link";
      label: string;
      href: string;
    }
  | MarketingNavMega;

export const MARKETING_NAV_ITEMS: MarketingNavItem[] = [
  { type: "link", label: "Home", href: "/" },
  {
    type: "mega",
    label: "Platform",
    href: "/#services",
    panelTitle: "Enterprise modules",
    panelCta: "View all modules",
    columns: [
      {
        title: "CRM",
        items: [
          { label: "Leads & pipeline", href: "/#services", description: "Capture and qualify inbound demand." },
          { label: "Contacts", href: "/#services", description: "Unified customer and partner records." },
          { label: "Deals", href: "/#services", description: "Forecast revenue with stage governance." },
        ],
      },
      {
        title: "KYC & compliance",
        items: [
          { label: "Individual KYC", href: "/#services", description: "Identity verification for retail clients." },
          { label: "Business KYB", href: "/#services", description: "Entity checks, UBOs, and registry data." },
          { label: "PEP & sanctions", href: "/#services", description: "Screening against global watchlists." },
          { label: "Document verification", href: "/#services", description: "OCR, liveness, and tamper checks." },
          { label: "Ongoing monitoring", href: "/#services", description: "Periodic re-verification workflows." },
        ],
      },
      {
        title: "Finance & ops",
        items: [
          { label: "Invoicing", href: "/#services", description: "Issue, track, and reconcile billing." },
          { label: "Payments", href: "/#services", description: "Settlement visibility across entities." },
          { label: "Reports", href: "/#impact", description: "Live KPIs for leadership and ops." },
        ],
      },
      {
        title: "Automation",
        items: [
          { label: "AI workflows", href: "/#services", description: "Assist follow-ups, reviews, and routing." },
          { label: "Approvals", href: "/#services", description: "Multi-step governance across teams." },
          { label: "Notifications", href: "/#services", description: "Alerts tied to SLA and policy events." },
        ],
      },
    ],
  },
  {
    type: "mega",
    label: "Services",
    href: "/#services",
    panelTitle: "Solutions & services",
    panelCta: "Explore all services",
    columns: [
      {
        title: "Revenue & growth",
        items: [
          {
            label: "CRM automation",
            href: "/#services",
            description: "Leads, conversations, and follow-ups in one workspace.",
          },
          {
            label: "Pipeline intelligence",
            href: "/#services",
            description: "Forecasting and stage governance for sales teams.",
          },
          {
            label: "Customer 360",
            href: "/#services",
            description: "Shared context across sales, ops, and finance.",
          },
        ],
      },
      {
        title: "Compliance",
        items: [
          {
            label: "Digital KYC",
            href: "/#services",
            description: "End-to-end identity verification workflows.",
          },
          {
            label: "KYB onboarding",
            href: "/#services",
            description: "Business entity checks with document parsing.",
          },
          {
            label: "Risk screening",
            href: "/#services",
            description: "PEP, sanctions, and adverse media monitoring.",
          },
        ],
      },
      {
        title: "Finance",
        items: [
          {
            label: "Smart invoicing",
            href: "/#services",
            description: "Generate, send, and reconcile invoices in real time.",
          },
          {
            label: "Billing operations",
            href: "/#services",
            description: "Multi-entity billing with audit-ready trails.",
          },
          {
            label: "Executive reporting",
            href: "/#impact",
            description: "Live dashboards for leadership and operations.",
          },
        ],
      },
      {
        title: "Operations",
        items: [
          {
            label: "Workflow collaboration",
            href: "/#services",
            description: "Approvals, tasks, and ownership in one layer.",
          },
          {
            label: "AI-assisted ops",
            href: "/#services",
            description: "Automate reviews, routing, and repetitive tasks.",
          },
          {
            label: "Omnichannel comms",
            href: "/#services",
            description: "Email and messaging tied to CRM records.",
          },
        ],
      },
    ],
  },
  { type: "link", label: "About", href: "/about" },
  { type: "link", label: "Pricing", href: "/pricing" },
  { type: "link", label: "Contact", href: "/contact" },
];
