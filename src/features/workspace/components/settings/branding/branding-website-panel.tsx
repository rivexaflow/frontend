"use client";

import { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  GripVertical,
  LayoutTemplate,
  Plus,
  Trash2,
} from "lucide-react";

import { BrandingWebsitePreview } from "@/features/workspace/components/settings/branding/branding-website-preview";
import { SettingsField, SettingsSection } from "@/features/workspace/components/settings/settings-ui-primitives";
import { crm } from "@/features/workspace/components/crm/crm-styles";
import type {
  WebsiteFaqItem,
  WebsiteSection,
  WebsiteSectionContent,
  WebsiteSectionType,
  WebsiteTestimonial,
  WorkspaceThemeConfig,
} from "@/features/workspace/schemas/branding.schema";
import { WEBSITE_SECTION_LABELS } from "@/features/workspace/schemas/branding.schema";
import { cn } from "@/lib/utils/cn";

type Props = {
  brandName: string;
  logo: string;
  companySlug: string;
  mainDomain: string;
  platformSubdomain: string;
  theme: WorkspaceThemeConfig;
  onChange: (patch: Partial<WorkspaceThemeConfig>) => void;
};

function isValidUrl(value: string): boolean {
  if (!value.trim()) return true;
  try {
    new URL(value.startsWith("http") ? value : `https://${value}`);
    return true;
  } catch {
    return false;
  }
}

function updateSection(
  sections: WebsiteSection[],
  id: string,
  patch: Partial<WebsiteSection> | ((s: WebsiteSection) => WebsiteSection),
): WebsiteSection[] {
  return sections.map((s) => {
    if (s.id !== id) return s;
    return typeof patch === "function" ? patch(s) : { ...s, ...patch };
  });
}

function updateSectionContent(
  sections: WebsiteSection[],
  id: string,
  contentPatch: Partial<WebsiteSectionContent>,
): WebsiteSection[] {
  return updateSection(sections, id, (s) => ({
    ...s,
    content: { ...s.content, ...contentPatch },
  }));
}

function moveSection(sections: WebsiteSection[], id: string, direction: -1 | 1): WebsiteSection[] {
  const index = sections.findIndex((s) => s.id === id);
  if (index < 0) return sections;
  const next = index + direction;
  if (next < 0 || next >= sections.length) return sections;
  const copy = [...sections];
  [copy[index], copy[next]] = [copy[next], copy[index]];
  return copy;
}

export function BrandingWebsitePanel({
  brandName,
  logo,
  companySlug,
  mainDomain,
  platformSubdomain,
  theme,
  onChange,
}: Props) {
  const [expandedId, setExpandedId] = useState<string | null>("hero");
  const [previewOpen, setPreviewOpen] = useState(true);
  const sections = theme.websiteSections || [];

  const setSections = (next: WebsiteSection[]) => onChange({ websiteSections: next });

  const togglePage = (pageId: string) => {
    onChange({
      websitePages: (theme.websitePages || []).map((p) =>
        p.id === pageId ? { ...p, enabled: !p.enabled } : p,
      ),
    });
  };

  return (
    <div className="space-y-5">
      <SettingsSection
        title="Website mode"
        description="Choose how your company presents itself on the web."
        icon={LayoutTemplate}
      >
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {(
            [
              ["none", "No public site", "Workspace portal only"],
              ["hosted", "Hosted site", "Build on your subdomain"],
              ["external", "External site", "Link existing website"],
            ] as const
          ).map(([mode, title, desc]) => (
            <button
              key={mode}
              type="button"
              onClick={() => onChange({ websiteMode: mode })}
              className={cn(
                "rounded-xl border p-4 text-left transition",
                theme.websiteMode === mode
                  ? "border-[#2277FF] bg-blue-50/60 ring-2 ring-[#2277FF]/20 dark:bg-blue-950/20"
                  : "border-slate-200 hover:border-slate-300 dark:border-slate-800",
              )}
            >
              <p className="text-sm font-bold text-slate-900 dark:text-white">{title}</p>
              <p className="mt-1 text-[11px] text-slate-500">{desc}</p>
            </button>
          ))}
        </div>
      </SettingsSection>

      {theme.websiteMode === "external" ? (
        <SettingsSection title="External website" description="Point visitors to your existing site.">
          <SettingsField label="Website URL" htmlFor="external-url">
            <input
              id="external-url"
              type="url"
              className={cn(crm.input, "w-full max-w-xl font-mono text-sm")}
              value={theme.websiteUrl || ""}
              onChange={(e) => onChange({ websiteUrl: e.target.value })}
              placeholder="https://www.mycompany.com"
            />
            {theme.websiteUrl && !isValidUrl(theme.websiteUrl) ? (
              <p className="mt-1 text-xs text-rose-600">Enter a valid URL.</p>
            ) : null}
          </SettingsField>
        </SettingsSection>
      ) : null}

      {theme.websiteMode === "hosted" ? (
        <div className="space-y-5">
          <SettingsSection
            title="Site builder"
            description="Enable sections, reorder them, and edit content for your public landing page."
            icon={LayoutTemplate}
            className="min-w-0 overflow-hidden"
          >
            <SettingsField label="Public URL" htmlFor="website-subdomain">
              <div className="rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-2.5 dark:border-slate-800 dark:bg-slate-900/50">
                <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
                  <span className="shrink-0 font-mono text-sm text-slate-400">https://</span>
                  <input
                    id="website-subdomain"
                    type="text"
                    className={cn(crm.input, "w-full min-w-0 sm:max-w-[120px]")}
                    value={theme.websiteSubdomain || companySlug || "www"}
                    onChange={(e) => onChange({ websiteSubdomain: e.target.value })}
                  />
                  <span className="break-all font-mono text-sm text-slate-600 dark:text-slate-400">
                    .{mainDomain || platformSubdomain}
                  </span>
                </div>
              </div>
            </SettingsField>

            <p className="mb-3 mt-6 text-xs font-bold uppercase tracking-[0.14em] text-slate-400">Pages</p>
            <div className="mb-6 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              {(theme.websitePages || []).map((page) => (
                <label
                  key={page.id}
                  className="flex cursor-pointer items-center justify-between gap-3 rounded-lg border border-slate-200 px-3 py-2.5 dark:border-slate-800"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-800 dark:text-white">{page.label}</p>
                    <p className="truncate font-mono text-[11px] text-slate-400">{page.path}</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={page.enabled}
                    onChange={() => togglePage(page.id)}
                    className="h-4 w-4 shrink-0 rounded border-slate-300"
                  />
                </label>
              ))}
            </div>

            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
                Page sections ({sections.filter((s) => s.enabled).length} enabled)
              </p>
              <button
                type="button"
                onClick={() => setPreviewOpen((v) => !v)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 lg:hidden"
              >
                {previewOpen ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                {previewOpen ? "Hide preview" : "Show preview"}
              </button>
            </div>

            <div className="space-y-2">
              {sections.map((section, index) => {
                const expanded = expandedId === section.id;
                return (
                  <div
                    key={section.id}
                    className={cn(
                      "overflow-hidden rounded-xl border",
                      section.enabled
                        ? "border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/40"
                        : "border-dashed border-slate-200 bg-slate-50/50 opacity-80 dark:border-slate-800",
                    )}
                  >
                    <div className="flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:gap-2">
                      <div className="flex min-w-0 flex-1 items-center gap-2">
                        <GripVertical className="hidden h-4 w-4 shrink-0 text-slate-300 sm:block" />
                        <input
                          type="checkbox"
                          checked={section.enabled}
                          onChange={() =>
                            setSections(updateSection(sections, section.id, { enabled: !section.enabled }))
                          }
                          className="h-4 w-4 shrink-0 rounded border-slate-300"
                          aria-label={`Enable ${section.label}`}
                        />
                        <button
                          type="button"
                          onClick={() => setExpandedId(expanded ? null : section.id)}
                          className="min-w-0 flex-1 text-left"
                        >
                          <span className="block truncate text-sm font-bold text-slate-800 dark:text-white">
                            {section.label}
                          </span>
                          <span className="text-[10px] uppercase tracking-wider text-slate-400">
                            {WEBSITE_SECTION_LABELS[section.type]}
                          </span>
                        </button>
                      </div>
                      <div className="flex shrink-0 items-center justify-end gap-1 self-end sm:self-auto">
                        <button
                          type="button"
                          disabled={index === 0}
                          onClick={() => setSections(moveSection(sections, section.id, -1))}
                          className="rounded-lg border border-slate-200 p-1.5 text-slate-500 hover:bg-slate-50 disabled:opacity-30 dark:border-slate-700"
                          aria-label="Move up"
                        >
                          <ChevronUp className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          disabled={index === sections.length - 1}
                          onClick={() => setSections(moveSection(sections, section.id, 1))}
                          className="rounded-lg border border-slate-200 p-1.5 text-slate-500 hover:bg-slate-50 disabled:opacity-30 dark:border-slate-700"
                          aria-label="Move down"
                        >
                          <ChevronDown className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setExpandedId(expanded ? null : section.id)}
                          className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-[11px] font-semibold text-slate-600 dark:border-slate-700"
                        >
                          {expanded ? "Collapse" : "Edit"}
                        </button>
                      </div>
                    </div>

                    {expanded ? (
                      <div className="border-t border-slate-100 px-3 py-4 sm:px-4 dark:border-slate-800">
                        <SectionEditor
                          section={section}
                          onContent={(patch) => setSections(updateSectionContent(sections, section.id, patch))}
                        />
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </SettingsSection>

          <SettingsSection
            title="Live preview"
            description="How your hosted landing page will look."
            icon={LayoutTemplate}
            className={cn("min-w-0 overflow-hidden", !previewOpen && "hidden lg:block")}
          >
            <div className="mx-auto w-full max-w-3xl">
              <BrandingWebsitePreview brandName={brandName} logo={logo} theme={theme} />
            </div>
          </SettingsSection>
        </div>
      ) : null}
    </div>
  );
}

function SectionEditor({
  section,
  onContent,
}: {
  section: WebsiteSection;
  onContent: (patch: Partial<WebsiteSectionContent>) => void;
}) {
  const c = section.content;

  const field = (label: string, id: string, value: string, key: keyof WebsiteSectionContent, multiline = false) => (
    <SettingsField key={id} label={label} htmlFor={id}>
      {multiline ? (
        <textarea
          id={id}
          rows={3}
          className={cn(crm.input, "w-full resize-none")}
          value={value}
          onChange={(e) => onContent({ [key]: e.target.value })}
        />
      ) : (
        <input
          id={id}
          type="text"
          className={cn(crm.input, "w-full")}
          value={value}
          onChange={(e) => onContent({ [key]: e.target.value })}
        />
      )}
    </SettingsField>
  );

  switch (section.type as WebsiteSectionType) {
    case "hero":
      return (
        <div className="grid gap-3 md:grid-cols-2">
          {field("Headline", "hero-headline", c.headline || "", "headline")}
          {field("Subheadline", "hero-sub", c.subheadline || "", "subheadline")}
          {field("Primary CTA text", "hero-cta", c.ctaText || "", "ctaText")}
          {field("Primary CTA URL", "hero-cta-url", c.ctaUrl || "", "ctaUrl")}
          {field("Secondary CTA text", "hero-cta2", c.secondaryCtaText || "", "secondaryCtaText")}
          {field("Secondary CTA URL", "hero-cta2-url", c.secondaryCtaUrl || "", "secondaryCtaUrl")}
          {field("Background image URL", "hero-bg", c.backgroundImageUrl || "", "backgroundImageUrl")}
        </div>
      );

    case "logo-cloud":
      return (
        <div className="space-y-3">
          {field("Section title", "logos-title", c.headline || "", "headline")}
          <SettingsField label="Logo names (comma separated)" htmlFor="logos-list">
            <input
              id="logos-list"
              type="text"
              className={cn(crm.input, "w-full")}
              value={(c.logos || []).join(", ")}
              onChange={(e) =>
                onContent({
                  logos: e.target.value
                    .split(",")
                    .map((s) => s.trim())
                    .filter(Boolean),
                })
              }
            />
          </SettingsField>
        </div>
      );

    case "about":
      return (
        <div className="space-y-3">
          {field("Headline", "about-headline", c.headline || "", "headline")}
          {field("Body", "about-body", c.body || "", "body", true)}
          {field("Image URL", "about-image", c.imageUrl || "", "imageUrl")}
          {field("CTA text", "about-cta", c.ctaText || "", "ctaText")}
          {field("CTA URL", "about-cta-url", c.ctaUrl || "", "ctaUrl")}
        </div>
      );

    case "features":
      return (
        <div className="space-y-4">
          {field("Headline", "feat-headline", c.headline || "", "headline")}
          {field("Subheadline", "feat-sub", c.subheadline || "", "subheadline")}
          {(c.features || []).map((f, i) => (
            <div key={f.id} className="rounded-lg border border-slate-200 p-3 dark:border-slate-800">
              <p className="mb-2 text-[10px] font-bold uppercase text-slate-400">Feature {i + 1}</p>
              <div className="grid gap-2 md:grid-cols-2">
                <input
                  className={cn(crm.input, "w-full")}
                  value={f.title}
                  placeholder="Title"
                  onChange={(e) => {
                    const next = [...(c.features || [])];
                    next[i] = { ...f, title: e.target.value };
                    onContent({ features: next });
                  }}
                />
                <input
                  className={cn(crm.input, "w-full")}
                  value={f.description}
                  placeholder="Description"
                  onChange={(e) => {
                    const next = [...(c.features || [])];
                    next[i] = { ...f, description: e.target.value };
                    onContent({ features: next });
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      );

    case "stats":
      return (
        <div className="grid gap-3 sm:grid-cols-2">
          {(c.stats || []).map((s, i) => (
            <div key={s.id} className="rounded-lg border border-slate-200 p-3 dark:border-slate-800">
              <input
                className={cn(crm.input, "mb-2 w-full")}
                value={s.value}
                placeholder="Value"
                onChange={(e) => {
                  const next = [...(c.stats || [])];
                  next[i] = { ...s, value: e.target.value };
                  onContent({ stats: next });
                }}
              />
              <input
                className={cn(crm.input, "w-full")}
                value={s.label}
                placeholder="Label"
                onChange={(e) => {
                  const next = [...(c.stats || [])];
                  next[i] = { ...s, label: e.target.value };
                  onContent({ stats: next });
                }}
              />
            </div>
          ))}
        </div>
      );

    case "testimonials":
      return (
        <div className="space-y-4">
          {field("Section title", "test-headline", c.headline || "", "headline")}
          <TestimonialEditor items={c.testimonials || []} onChange={(testimonials) => onContent({ testimonials })} />
        </div>
      );

    case "faq":
      return (
        <div className="space-y-4">
          {field("Section title", "faq-headline", c.headline || "", "headline")}
          <FaqEditor items={c.faq || []} onChange={(faq) => onContent({ faq })} />
        </div>
      );

    case "pricing":
      return (
        <div className="space-y-3">
          {field("Section title", "price-headline", c.headline || "", "headline")}
          <p className="text-[11px] text-slate-400">Edit plan names, prices, and features in the saved JSON (backend editor coming).</p>
          {(c.plans || []).map((p, i) => (
            <div key={p.id} className="rounded-lg border border-slate-200 p-3 dark:border-slate-800">
              <div className="grid gap-2 md:grid-cols-3">
                <input
                  className={cn(crm.input, "w-full")}
                  value={p.name}
                  onChange={(e) => {
                    const next = [...(c.plans || [])];
                    next[i] = { ...p, name: e.target.value };
                    onContent({ plans: next });
                  }}
                />
                <input
                  className={cn(crm.input, "w-full")}
                  value={p.price}
                  onChange={(e) => {
                    const next = [...(c.plans || [])];
                    next[i] = { ...p, price: e.target.value };
                    onContent({ plans: next });
                  }}
                />
                <input
                  className={cn(crm.input, "w-full")}
                  value={p.period}
                  onChange={(e) => {
                    const next = [...(c.plans || [])];
                    next[i] = { ...p, period: e.target.value };
                    onContent({ plans: next });
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      );

    case "team":
      return (
        <div className="space-y-3">
          {field("Section title", "team-headline", c.headline || "", "headline")}
          {(c.team || []).map((m, i) => (
            <div key={m.id} className="grid gap-2 md:grid-cols-2">
              <input
                className={cn(crm.input, "w-full")}
                value={m.name}
                placeholder="Name"
                onChange={(e) => {
                  const next = [...(c.team || [])];
                  next[i] = { ...m, name: e.target.value };
                  onContent({ team: next });
                }}
              />
              <input
                className={cn(crm.input, "w-full")}
                value={m.role}
                placeholder="Role"
                onChange={(e) => {
                  const next = [...(c.team || [])];
                  next[i] = { ...m, role: e.target.value };
                  onContent({ team: next });
                }}
              />
            </div>
          ))}
        </div>
      );

    case "cta":
      return (
        <div className="grid gap-3 md:grid-cols-2">
          {field("Headline", "cta-headline", c.headline || "", "headline")}
          {field("Subheadline", "cta-sub", c.subheadline || "", "subheadline")}
          {field("Button text", "cta-btn", c.ctaText || "", "ctaText")}
          {field("Button URL", "cta-url", c.ctaUrl || "", "ctaUrl")}
        </div>
      );

    case "contact":
      return (
        <div className="grid gap-3 md:grid-cols-2">
          {field("Section title", "contact-headline", c.headline || "", "headline")}
          {field("Email", "contact-email", c.email || "", "email")}
          {field("Phone", "contact-phone", c.phone || "", "phone")}
          {field("Address", "contact-address", c.address || "", "address")}
        </div>
      );

    case "footer":
      return (
        <div className="space-y-3">
          {field("Copyright", "footer-copy", c.copyright || "", "copyright")}
        </div>
      );

    default:
      return <p className="text-xs text-slate-400">No editor for this section type.</p>;
  }
}

function FaqEditor({
  items,
  onChange,
}: {
  items: WebsiteFaqItem[];
  onChange: (items: WebsiteFaqItem[]) => void;
}) {
  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={item.id} className="rounded-lg border border-slate-200 p-3 dark:border-slate-800">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400">FAQ {i + 1}</span>
            <button
              type="button"
              onClick={() => onChange(items.filter((x) => x.id !== item.id))}
              className="text-slate-400 hover:text-rose-600"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
          <input
            className={cn(crm.input, "mb-2 w-full")}
            value={item.question}
            placeholder="Question"
            onChange={(e) => {
              const next = [...items];
              next[i] = { ...item, question: e.target.value };
              onChange(next);
            }}
          />
          <textarea
            className={cn(crm.input, "w-full resize-none")}
            rows={2}
            value={item.answer}
            placeholder="Answer"
            onChange={(e) => {
              const next = [...items];
              next[i] = { ...item, answer: e.target.value };
              onChange(next);
            }}
          />
        </div>
      ))}
      <button
        type="button"
        onClick={() =>
          onChange([...items, { id: `faq-${Date.now()}`, question: "", answer: "" }])
        }
        className="inline-flex items-center gap-1 text-xs font-semibold text-[#2277FF]"
      >
        <Plus className="h-3.5 w-3.5" /> Add FAQ
      </button>
    </div>
  );
}

function TestimonialEditor({
  items,
  onChange,
}: {
  items: WebsiteTestimonial[];
  onChange: (items: WebsiteTestimonial[]) => void;
}) {
  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={item.id} className="rounded-lg border border-slate-200 p-3 dark:border-slate-800">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400">Testimonial {i + 1}</span>
            <button
              type="button"
              onClick={() => onChange(items.filter((x) => x.id !== item.id))}
              className="text-slate-400 hover:text-rose-600"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
          <textarea
            className={cn(crm.input, "mb-2 w-full resize-none")}
            rows={2}
            value={item.quote}
            placeholder="Quote"
            onChange={(e) => {
              const next = [...items];
              next[i] = { ...item, quote: e.target.value };
              onChange(next);
            }}
          />
          <div className="grid gap-2 md:grid-cols-2">
            <input
              className={cn(crm.input, "w-full")}
              value={item.name}
              placeholder="Name"
              onChange={(e) => {
                const next = [...items];
                next[i] = { ...item, name: e.target.value };
                onChange(next);
              }}
            />
            <input
              className={cn(crm.input, "w-full")}
              value={item.role}
              placeholder="Role / company"
              onChange={(e) => {
                const next = [...items];
                next[i] = { ...item, role: e.target.value };
                onChange(next);
              }}
            />
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={() =>
          onChange([...items, { id: `t-${Date.now()}`, name: "", role: "", quote: "" }])
        }
        className="inline-flex items-center gap-1 text-xs font-semibold text-[#2277FF]"
      >
        <Plus className="h-3.5 w-3.5" /> Add testimonial
      </button>
    </div>
  );
}
