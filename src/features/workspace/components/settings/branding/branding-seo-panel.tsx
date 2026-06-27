"use client";

import { Search } from "lucide-react";

import { ImageUploadField } from "@/features/workspace/components/settings/branding/branding-shared";
import { SettingsField, SettingsSection } from "@/features/workspace/components/settings/settings-ui-primitives";
import { crm } from "@/features/workspace/components/crm/crm-styles";
import type { WorkspaceThemeConfig } from "@/features/workspace/schemas/branding.schema";
import { cn } from "@/lib/utils/cn";

type Props = {
  brandName: string;
  theme: WorkspaceThemeConfig;
  onChange: (patch: Partial<WorkspaceThemeConfig>) => void;
};

export function BrandingSeoPanel({ brandName, theme, onChange }: Props) {
  const metaTitle = theme.metaTitle || theme.browserTitle || brandName || "Company";
  const metaDescription =
    theme.metaDescription || "Your company workspace portal — CRM, HRM, and more.";

  return (
    <div className="space-y-5">
      <SettingsSection
        title="Search engine optimization"
        description="Control how search engines index your public site and login portal."
        icon={Search}
      >
        <div className="grid max-w-3xl gap-4">
          <SettingsField label="Meta title" htmlFor="meta-title">
            <input
              id="meta-title"
              type="text"
              className={cn(crm.input, "w-full")}
              value={theme.metaTitle || ""}
              onChange={(e) => onChange({ metaTitle: e.target.value })}
              placeholder={brandName || "Company name"}
              maxLength={70}
            />
            <p className="mt-1 text-[10px] text-slate-400">{(theme.metaTitle || "").length}/70 characters</p>
          </SettingsField>

          <SettingsField label="Meta description" htmlFor="meta-description">
            <textarea
              id="meta-description"
              rows={3}
              className={cn(crm.input, "w-full resize-none")}
              value={theme.metaDescription || ""}
              onChange={(e) => onChange({ metaDescription: e.target.value })}
              placeholder="Brief description for Google and link previews."
              maxLength={160}
            />
            <p className="mt-1 text-[10px] text-slate-400">{(theme.metaDescription || "").length}/160 characters</p>
          </SettingsField>

          <SettingsField label="Meta keywords" htmlFor="meta-keywords">
            <input
              id="meta-keywords"
              type="text"
              className={cn(crm.input, "w-full")}
              value={theme.metaKeywords || ""}
              onChange={(e) => onChange({ metaKeywords: e.target.value })}
              placeholder="crm, sales, hr, workforce"
            />
          </SettingsField>

          <SettingsField label="Robots directive" htmlFor="meta-robots">
            <select
              id="meta-robots"
              className={cn(crm.select, "h-9 w-full max-w-md text-sm")}
              value={theme.metaRobots || "index, follow"}
              onChange={(e) => onChange({ metaRobots: e.target.value })}
            >
              <option value="index, follow">Index, follow (public)</option>
              <option value="noindex, follow">No index, follow</option>
              <option value="index, nofollow">Index, no follow</option>
              <option value="noindex, nofollow">No index, no follow (private)</option>
            </select>
          </SettingsField>

          <SettingsField label="Canonical URL" htmlFor="canonical-url">
            <input
              id="canonical-url"
              type="url"
              className={cn(crm.input, "w-full font-mono text-sm")}
              value={theme.canonicalUrl || ""}
              onChange={(e) => onChange({ canonicalUrl: e.target.value })}
              placeholder="https://www.mycompany.com"
            />
          </SettingsField>
        </div>
      </SettingsSection>

      <SettingsSection title="Social sharing" description="Open Graph and Twitter card metadata.">
        <div className="grid max-w-3xl gap-4">
          <ImageUploadField
            id="og-image"
            label="Open Graph image"
            accept="image/png,image/jpeg"
            value={theme.ogImage || ""}
            onChange={(v) => onChange({ ogImage: v })}
            hint="1200×630 PNG or JPEG recommended for link previews."
          />

          <SettingsField label="Twitter / X handle" htmlFor="twitter-handle">
            <div className="flex max-w-md items-center gap-1">
              <span className="text-slate-400">@</span>
              <input
                id="twitter-handle"
                type="text"
                className={cn(crm.input, "w-full")}
                value={(theme.twitterHandle || "").replace(/^@/, "")}
                onChange={(e) => onChange({ twitterHandle: e.target.value.replace(/^@/, "") })}
                placeholder="mycompany"
              />
            </div>
          </SettingsField>
        </div>
      </SettingsSection>

      <SettingsSection title="Preview" description="How your link may appear when shared.">
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800">
            <div className="border-b border-slate-100 bg-slate-50 px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:border-slate-800">
              Google search result
            </div>
            <div className="space-y-1 p-4">
              <p className="text-sm text-[#1a0dab] dark:text-[#8ab4f8]">{metaTitle}</p>
              <p className="font-mono text-xs text-[#006621] dark:text-emerald-400">
                {theme.canonicalUrl || "https://www.mycompany.com"}
              </p>
              <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400">{metaDescription}</p>
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800">
            <div className="border-b border-slate-100 bg-slate-50 px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:border-slate-800">
              Social card
            </div>
            {theme.ogImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={theme.ogImage} alt="" className="h-32 w-full object-cover" />
            ) : (
              <div className="flex h-32 items-center justify-center bg-slate-100 text-xs text-slate-400 dark:bg-slate-800">
                No OG image set
              </div>
            )}
            <div className="space-y-0.5 p-3">
              <p className="text-[10px] uppercase text-slate-400">{theme.canonicalUrl || "mycompany.com"}</p>
              <p className="text-sm font-bold text-slate-900 dark:text-white">{metaTitle}</p>
              <p className="line-clamp-2 text-xs text-slate-500">{metaDescription}</p>
            </div>
          </div>
        </div>
      </SettingsSection>
    </div>
  );
}
