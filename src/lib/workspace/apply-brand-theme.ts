import type { WorkspaceThemeConfig } from "@/features/workspace/schemas/branding.schema";

function hexToRgb(hex: string): string | null {
  const normalized = hex.replace("#", "");
  if (!/^[0-9a-fA-F]{6}$/.test(normalized)) return null;
  const r = parseInt(normalized.slice(0, 2), 16);
  const g = parseInt(normalized.slice(2, 4), 16);
  const b = parseInt(normalized.slice(4, 6), 16);
  return `${r}, ${g}, ${b}`;
}

export function applyBrandTheme(themeConfig: WorkspaceThemeConfig | null | undefined) {
  if (typeof document === "undefined" || !themeConfig) return;

  if (themeConfig.primaryColor) {
    document.documentElement.style.setProperty("--primary-color", themeConfig.primaryColor);
    const rgb = hexToRgb(themeConfig.primaryColor);
    if (rgb) document.documentElement.style.setProperty("--primary-color-rgb", rgb);
  }

  if (themeConfig.fontFamily) {
    document.documentElement.style.setProperty("--brand-font-family", themeConfig.fontFamily);
  }

  if (themeConfig.favicon) {
    let link = document.querySelector<HTMLLinkElement>("link[data-brand-favicon='true']");
    if (!link) {
      link = document.createElement("link");
      link.rel = "icon";
      link.setAttribute("data-brand-favicon", "true");
      document.head.appendChild(link);
    }
    link.href = themeConfig.favicon;
  }

  if (themeConfig.browserTitle) {
    document.title = themeConfig.browserTitle;
  }
}
