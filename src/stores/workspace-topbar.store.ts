"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type SearchableFieldId =
  | "name"
  | "email"
  | "phone"
  | "company"
  | "source"
  | "owner"
  | "reference"
  | "title";

export const SEARCHABLE_FIELD_OPTIONS: { id: SearchableFieldId; label: string; defaultOn: boolean }[] = [
  { id: "name", label: "Name", defaultOn: true },
  { id: "title", label: "Job title", defaultOn: false },
  { id: "email", label: "Email", defaultOn: true },
  { id: "phone", label: "Phone", defaultOn: true },
  { id: "company", label: "Company", defaultOn: true },
  { id: "source", label: "Source", defaultOn: false },
  { id: "owner", label: "Owner", defaultOn: false },
  { id: "reference", label: "Lead reference", defaultOn: true },
];

export type AdvancedLeadFilters = {
  responsiblePerson: string;
  leadStage: string;
  createdFrom: string;
  createdTo: string;
  modifiedFrom: string;
  modifiedTo: string;
  department: string;
  team: string;
  source: string;
  showDuplicates: boolean;
  createdBy: string;
  modifiedBy: string;
  clientCode: string;
  segment: string;
  activationDate: string;
  additionalNumber: string;
};

export const EMPTY_ADVANCED_FILTERS: AdvancedLeadFilters = {
  responsiblePerson: "",
  leadStage: "",
  createdFrom: "",
  createdTo: "",
  modifiedFrom: "",
  modifiedTo: "",
  department: "",
  team: "",
  source: "",
  showDuplicates: false,
  createdBy: "",
  modifiedBy: "",
  clientCode: "",
  segment: "",
  activationDate: "",
  additionalNumber: "",
};

type WorkspaceTopbarState = {
  quickSearch: string;
  searchableFields: Record<SearchableFieldId, boolean>;
  advancedFilters: AdvancedLeadFilters;
  advancedFiltersActive: boolean;
  setQuickSearch: (query: string) => void;
  setSearchableField: (id: SearchableFieldId, enabled: boolean) => void;
  resetSearchableFields: () => void;
  setAdvancedFilters: (filters: AdvancedLeadFilters) => void;
  clearAdvancedFilters: () => void;
  setAdvancedFiltersActive: (active: boolean) => void;
};

function defaultSearchableFields(): Record<SearchableFieldId, boolean> {
  return SEARCHABLE_FIELD_OPTIONS.reduce(
    (acc, field) => {
      acc[field.id] = field.defaultOn;
      return acc;
    },
    {} as Record<SearchableFieldId, boolean>,
  );
}

export const workspaceTopbarStore = create<WorkspaceTopbarState>()(
  persist(
    (set) => ({
      quickSearch: "",
      searchableFields: defaultSearchableFields(),
      advancedFilters: EMPTY_ADVANCED_FILTERS,
      advancedFiltersActive: false,
      setQuickSearch: (query) => set({ quickSearch: query }),
      setSearchableField: (id, enabled) =>
        set((state) => ({
          searchableFields: { ...state.searchableFields, [id]: enabled },
        })),
      resetSearchableFields: () => set({ searchableFields: defaultSearchableFields() }),
      setAdvancedFilters: (filters) => set({ advancedFilters: filters, advancedFiltersActive: true }),
      clearAdvancedFilters: () =>
        set({ advancedFilters: EMPTY_ADVANCED_FILTERS, advancedFiltersActive: false }),
      setAdvancedFiltersActive: (active) => set({ advancedFiltersActive: active }),
    }),
    {
      name: "rvx-workspace-topbar",
      partialize: (state) => ({
        searchableFields: state.searchableFields,
        advancedFilters: state.advancedFilters,
        advancedFiltersActive: state.advancedFiltersActive,
      }),
    },
  ),
);
