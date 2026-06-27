"use client";

import type { WorkspaceThemeConfig, WebsiteSection } from "@/features/workspace/schemas/branding.schema";
import { cn } from "@/lib/utils/cn";

type Props = {
  brandName: string;
  logo: string;
  theme: WorkspaceThemeConfig;
};

export function BrandingWebsitePreview({ brandName, logo, theme }: Props) {
  const primary = theme.primaryColor || "#191970";
  const secondary = theme.secondaryColor || "#2277FF";
  const sections = (theme.websiteSections || []).filter((s) => s.enabled);

  return (
    <div className="w-full max-w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50 px-3 py-2 dark:border-slate-800 dark:bg-slate-900">
        <span className="h-2.5 w-2.5 rounded-full bg-rose-400" />
        <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
        <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
        <span className="ml-2 truncate font-mono text-[10px] text-slate-400">
          {theme.websiteSubdomain || "www"}.{brandName.toLowerCase().replace(/\s+/g, "") || "company"}.com
        </span>
      </div>

      <div className="max-h-[min(70vh,640px)] overflow-y-auto overflow-x-hidden">
        {/* Nav bar */}
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 dark:border-slate-800">
          <div className="flex items-center gap-2">
            {logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logo} alt="" className="h-6 w-6 object-contain" />
            ) : (
              <div className="flex h-6 w-6 items-center justify-center rounded bg-slate-200 text-[9px] font-bold dark:bg-slate-800">
                {(brandName || "C").slice(0, 1)}
              </div>
            )}
            <span className="text-xs font-bold text-slate-800 dark:text-white">{brandName || "Company"}</span>
          </div>
          <div className="hidden gap-3 sm:flex">
            {(theme.websitePages || [])
              .filter((p) => p.enabled)
              .slice(0, 4)
              .map((p) => (
                <span key={p.id} className="text-[10px] text-slate-500">
                  {p.label}
                </span>
              ))}
          </div>
        </div>

        {sections.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">Enable sections below to preview your site.</div>
        ) : (
          sections.map((section) => (
            <SectionPreview key={section.id} section={section} primary={primary} secondary={secondary} />
          ))
        )}
      </div>
    </div>
  );
}

function SectionPreview({
  section,
  primary,
  secondary,
}: {
  section: WebsiteSection;
  primary: string;
  secondary: string;
}) {
  const c = section.content;

  switch (section.type) {
    case "hero":
      return (
        <div
          className="px-6 py-10 text-center"
          style={{
            background: c.backgroundImageUrl
              ? `linear-gradient(rgba(0,0,0,.5),rgba(0,0,0,.5)), url(${c.backgroundImageUrl}) center/cover`
              : `linear-gradient(135deg, ${primary}12, ${secondary}10)`,
          }}
        >
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">{c.headline}</h2>
          <p className="mx-auto mt-2 max-w-md text-xs text-slate-600 dark:text-slate-400">{c.subheadline}</p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {c.ctaText ? (
              <span className="rounded-lg px-3 py-1.5 text-[10px] font-bold text-white" style={{ background: primary }}>
                {c.ctaText}
              </span>
            ) : null}
            {c.secondaryCtaText ? (
              <span className="rounded-lg border border-slate-300 px-3 py-1.5 text-[10px] font-bold text-slate-700">
                {c.secondaryCtaText}
              </span>
            ) : null}
          </div>
        </div>
      );

    case "logo-cloud":
      return (
        <div className="border-t border-slate-100 px-6 py-6 dark:border-slate-800">
          <p className="mb-3 text-center text-[10px] font-bold uppercase tracking-wider text-slate-400">{c.headline}</p>
          <div className="flex flex-wrap justify-center gap-3">
            {(c.logos || []).map((logo) => (
              <span key={logo} className="rounded bg-slate-100 px-3 py-1 text-[10px] font-semibold text-slate-500 dark:bg-slate-800">
                {logo}
              </span>
            ))}
          </div>
        </div>
      );

    case "about":
      return (
        <div className="grid gap-4 border-t border-slate-100 px-6 py-8 md:grid-cols-2 dark:border-slate-800">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">{c.headline}</h3>
            <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-400">{c.body}</p>
          </div>
          <div className="min-h-[80px] rounded-xl bg-slate-100 dark:bg-slate-800" />
        </div>
      );

    case "features":
      return (
        <div className="border-t border-slate-100 px-6 py-8 dark:border-slate-800">
          <h3 className="text-center text-sm font-bold text-slate-900 dark:text-white">{c.headline}</h3>
          <p className="mt-1 text-center text-xs text-slate-500">{c.subheadline}</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {(c.features || []).map((f) => (
              <div key={f.id} className="rounded-xl border border-slate-200 p-3 dark:border-slate-800">
                <p className="text-xs font-bold text-slate-800 dark:text-white">{f.title}</p>
                <p className="mt-1 text-[10px] text-slate-500">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      );

    case "stats":
      return (
        <div className="grid grid-cols-2 gap-3 border-t border-slate-100 px-6 py-6 sm:grid-cols-4 dark:border-slate-800">
          {(c.stats || []).map((s) => (
            <div key={s.id} className="text-center">
              <p className="text-base font-bold" style={{ color: primary }}>
                {s.value}
              </p>
              <p className="text-[10px] text-slate-500">{s.label}</p>
            </div>
          ))}
        </div>
      );

    case "testimonials":
      return (
        <div className="border-t border-slate-100 px-6 py-8 dark:border-slate-800">
          <h3 className="mb-4 text-center text-sm font-bold text-slate-900 dark:text-white">{c.headline}</h3>
          <div className="grid gap-3 sm:grid-cols-3">
            {(c.testimonials || []).map((t) => (
              <div key={t.id} className="rounded-xl border border-slate-200 p-3 dark:border-slate-800">
                <p className="text-[10px] italic text-slate-600 dark:text-slate-400">&ldquo;{t.quote}&rdquo;</p>
                <p className="mt-2 text-[10px] font-bold text-slate-800 dark:text-white">{t.name}</p>
                <p className="text-[9px] text-slate-400">{t.role}</p>
              </div>
            ))}
          </div>
        </div>
      );

    case "faq":
      return (
        <div className="border-t border-slate-100 px-6 py-8 dark:border-slate-800">
          <h3 className="mb-4 text-center text-sm font-bold text-slate-900 dark:text-white">{c.headline}</h3>
          <div className="mx-auto max-w-lg space-y-2">
            {(c.faq || []).map((item) => (
              <div key={item.id} className="rounded-lg border border-slate-200 px-3 py-2 dark:border-slate-800">
                <p className="text-[11px] font-bold text-slate-800 dark:text-white">{item.question}</p>
                <p className="mt-1 text-[10px] text-slate-500">{item.answer}</p>
              </div>
            ))}
          </div>
        </div>
      );

    case "pricing":
      return (
        <div className="border-t border-slate-100 px-6 py-8 dark:border-slate-800">
          <h3 className="mb-4 text-center text-sm font-bold">{c.headline}</h3>
          <div className="grid gap-3 sm:grid-cols-3">
            {(c.plans || []).map((p) => (
              <div
                key={p.id}
                className={cn(
                  "rounded-xl border p-3",
                  p.highlighted ? "border-[#2277FF] bg-blue-50/50 dark:bg-blue-950/20" : "border-slate-200 dark:border-slate-800",
                )}
              >
                <p className="text-xs font-bold">{p.name}</p>
                <p className="mt-1 text-lg font-bold" style={{ color: primary }}>
                  {p.price}
                  <span className="text-[10px] font-normal text-slate-400">{p.period}</span>
                </p>
                <ul className="mt-2 space-y-1">
                  {p.features.map((f) => (
                    <li key={f} className="text-[10px] text-slate-500">
                      • {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      );

    case "team":
      return (
        <div className="border-t border-slate-100 px-6 py-8 dark:border-slate-800">
          <h3 className="mb-4 text-center text-sm font-bold">{c.headline}</h3>
          <div className="flex flex-wrap justify-center gap-4">
            {(c.team || []).map((m) => (
              <div key={m.id} className="text-center">
                <div className="mx-auto h-12 w-12 rounded-full bg-slate-200 dark:bg-slate-800" />
                <p className="mt-2 text-[11px] font-bold">{m.name}</p>
                <p className="text-[10px] text-slate-400">{m.role}</p>
              </div>
            ))}
          </div>
        </div>
      );

    case "cta":
      return (
        <div className="px-6 py-8 text-center" style={{ background: `linear-gradient(135deg, ${primary}, ${secondary})` }}>
          <h3 className="text-sm font-bold text-white">{c.headline}</h3>
          <p className="mt-1 text-xs text-white/80">{c.subheadline}</p>
          {c.ctaText ? (
            <span className="mt-3 inline-block rounded-lg bg-white px-4 py-1.5 text-[10px] font-bold text-slate-900">
              {c.ctaText}
            </span>
          ) : null}
        </div>
      );

    case "contact":
      return (
        <div className="border-t border-slate-100 px-6 py-8 dark:border-slate-800">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">{c.headline}</h3>
          <div className="mt-3 space-y-1 text-[10px] text-slate-500">
            {c.email ? <p>✉ {c.email}</p> : null}
            {c.phone ? <p>☎ {c.phone}</p> : null}
            {c.address ? <p>📍 {c.address}</p> : null}
          </div>
        </div>
      );

    case "footer":
      return (
        <div className="border-t border-slate-200 bg-slate-50 px-6 py-4 dark:border-slate-800 dark:bg-slate-900">
          <p className="text-center text-[10px] text-slate-500">{c.copyright}</p>
        </div>
      );

    default:
      return null;
  }
}
