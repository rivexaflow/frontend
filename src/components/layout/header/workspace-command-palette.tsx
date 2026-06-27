/** @deprecated Use WorkspaceGlobalSearch from workspace-global-search.tsx */
export {
  WorkspaceGlobalSearch as WorkspaceCommandPalette,
  WorkspaceGlobalSearch,
} from "@/components/layout/header/workspace-global-search";

export function useWorkspaceCommandPalette() {
  return {
    open: false,
    openPalette: () => {
      const input = document.querySelector<HTMLInputElement>('input[aria-label="Search workspace"]');
      input?.focus();
      input?.click();
    },
    closePalette: () => {
      document.querySelector<HTMLInputElement>('input[aria-label="Search workspace"]')?.blur();
    },
    togglePalette: () => {
      const input = document.querySelector<HTMLInputElement>('input[aria-label="Search workspace"]');
      if (document.activeElement === input) input?.blur();
      else {
        input?.focus();
        input?.click();
      }
    },
  };
}
