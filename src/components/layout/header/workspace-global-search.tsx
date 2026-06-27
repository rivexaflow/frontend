"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Clock, Filter, Loader2, Search, Settings2 } from "lucide-react";

import { useWorkspaceGlobalSearch } from "@/features/workspace/hooks/use-workspace-global-search";
import {
  groupSearchResults,
  loadRecentSearches,
  saveRecentSearch,
  type RecentSearch,
  type WorkspaceSearchResult,
} from "@/lib/workspace/workspace-global-search";
import { cn } from "@/lib/utils/cn";

function HighlightText({ text, query }: { text: string; query: string }) {
  const term = query.trim();
  if (!term) return <>{text}</>;

  const lower = text.toLowerCase();
  const idx = lower.indexOf(term.toLowerCase());
  if (idx < 0) return <>{text}</>;

  return (
    <>
      {text.slice(0, idx)}
      <mark className="rounded bg-[#2277FF]/20 px-0.5 text-inherit">{text.slice(idx, idx + term.length)}</mark>
      {text.slice(idx + term.length)}
    </>
  );
}

function ResultsPanel({
  query,
  loading,
  grouped,
  flatResults,
  selectedIndex,
  recent,
  onHover,
  onSelect,
  onSelectRecent,
  className,
}: {
  query: string;
  loading: boolean;
  grouped: { category: string; items: WorkspaceSearchResult[] }[];
  flatResults: WorkspaceSearchResult[];
  selectedIndex: number;
  recent: RecentSearch[];
  onHover: (index: number) => void;
  onSelect: (item: WorkspaceSearchResult) => void;
  onSelectRecent: (item: RecentSearch, index: number) => void;
  className?: string;
}) {
  let runningIndex = -1;

  return (
    <div className={cn("overflow-hidden rounded-xl border border-slate-200/90 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900", className)}>
      <div className="max-h-[min(440px,60vh)] overflow-y-auto p-2">
        {loading && flatResults.length === 0 ? (
          <div className="flex items-center justify-center gap-2 px-3 py-10 text-sm text-slate-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            Searching workspace…
          </div>
        ) : flatResults.length === 0 ? (
          <p className="px-3 py-8 text-center text-sm text-slate-500">
            {query.trim() ? `No results for “${query.trim()}”` : "Type to search people, records, and pages"}
          </p>
        ) : (
          grouped.map((group) => (
            <div key={group.category} className="mb-1">
              <p className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                {group.category}
                <span className="ml-1.5 font-medium text-slate-300">({group.items.length})</span>
              </p>
              <ul>
                {group.items.map((item) => {
                  runningIndex += 1;
                  const index = runningIndex;
                  return (
                    <li key={item.id} data-search-index={index}>
                      <button
                        type="button"
                        onClick={() => onSelect(item)}
                        onMouseEnter={() => onHover(index)}
                        className={cn(
                          "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition",
                          index === selectedIndex
                            ? "bg-[#191970]/8 dark:bg-[#2277FF]/15"
                            : "hover:bg-slate-50 dark:hover:bg-slate-800",
                        )}
                      >
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#191970]/8 text-[#191970] dark:bg-[#2277FF]/15 dark:text-[#2277FF]">
                          <item.icon className="h-4 w-4" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-semibold text-slate-900 dark:text-white">
                            <HighlightText text={item.label} query={query} />
                          </span>
                          <span className="block truncate text-xs text-slate-500">{item.hint}</span>
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))
        )}

        {!query.trim() && recent.length > 0 ? (
          <div className="mt-1 border-t border-slate-100 pt-2 dark:border-slate-800">
            <p className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">Recent</p>
            <ul>
              {recent.map((item, index) => {
                const recentIndex = flatResults.length + index;
                return (
                  <li key={`${item.href}-${item.label}`} data-search-index={recentIndex}>
                    <button
                      type="button"
                      onClick={() => onSelectRecent(item, recentIndex)}
                      onMouseEnter={() => onHover(recentIndex)}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm transition",
                        recentIndex === selectedIndex
                          ? "bg-[#191970]/8 dark:bg-[#2277FF]/15"
                          : "hover:bg-slate-50 dark:hover:bg-slate-800",
                      )}
                    >
                      <Clock className="h-4 w-4 shrink-0 text-slate-400" />
                      <span className="min-w-0 flex-1 truncate font-medium text-slate-700 dark:text-slate-200">{item.label}</span>
                      <span className="shrink-0 text-xs text-slate-400">{item.category}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ) : null}
      </div>

      <div className="border-t border-slate-100 px-3 py-2 text-[11px] text-slate-400 dark:border-slate-800">
        {flatResults.length > 0 ? (
          <span>
            <span className="font-semibold text-slate-600 dark:text-slate-300">{flatResults.length}</span> results
          </span>
        ) : (
          <span>Employees · Leads · Deals · Attendance · KYC · Pages</span>
        )}
        {" · "}
        <kbd className="rounded border border-slate-200 px-1 font-mono text-[10px]">↵</kbd> open
        {" · "}
        <kbd className="rounded border border-slate-200 px-1 font-mono text-[10px]">esc</kbd> close
      </div>
    </div>
  );
}

const searchToolBtn =
  "inline-flex h-6 w-6 items-center justify-center rounded-md text-slate-400 transition hover:bg-white hover:text-[#191970] dark:hover:bg-slate-800 dark:hover:text-[#2277FF]";

type WorkspaceGlobalSearchProps = {
  className?: string;
  onOpenSearchableFields: () => void;
  onOpenAdvancedFilters: () => void;
  advancedFiltersActive?: boolean;
};

export function WorkspaceGlobalSearch({
  className,
  onOpenSearchableFields,
  onOpenAdvancedFilters,
  advancedFiltersActive = false,
}: WorkspaceGlobalSearchProps) {
  const router = useRouter();
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [recent, setRecent] = useState<RecentSearch[]>([]);

  const { results, loading } = useWorkspaceGlobalSearch(query, open);
  const grouped = useMemo(() => groupSearchResults(results), [results]);
  const flatResults = useMemo(() => grouped.flatMap((group) => group.items), [grouped]);
  const totalSelectable = flatResults.length + (query.trim() ? 0 : recent.length);

  const navigate = useCallback(
    (href: string, meta?: RecentSearch) => {
      if (meta) saveRecentSearch(meta);
      setOpen(false);
      setQuery("");
      setSelectedIndex(0);
      setRecent(loadRecentSearches());
      router.push(href);
    },
    [router],
  );

  const handleSelect = useCallback(
    (item: WorkspaceSearchResult) => {
      navigate(item.href, { label: item.label, href: item.href, category: item.category });
    },
    [navigate],
  );

  const handleSelectRecent = useCallback(
    (item: RecentSearch) => {
      navigate(item.href, item);
    },
    [navigate],
  );

  useEffect(() => {
    setRecent(loadRecentSearches());
  }, []);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query, results]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen(true);
        requestAnimationFrame(() => inputRef.current?.focus());
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        setOpen(false);
        inputRef.current?.blur();
        return;
      }

      if (totalSelectable === 0) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((index) => Math.min(index + 1, totalSelectable - 1));
        return;
      }

      if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((index) => Math.max(index - 1, 0));
        return;
      }

      if (e.key === "Enter") {
        e.preventDefault();
        if (selectedIndex < flatResults.length && flatResults[selectedIndex]) {
          handleSelect(flatResults[selectedIndex]!);
          return;
        }
        const recentIndex = selectedIndex - flatResults.length;
        if (!query.trim() && recent[recentIndex]) handleSelectRecent(recent[recentIndex]!);
      }
    };

    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, totalSelectable, flatResults, selectedIndex, recent, query, handleSelect, handleSelectRecent]);

  useEffect(() => {
    if (!open) return;
    const el = document.querySelector(`[data-search-index="${selectedIndex}"]`);
    el?.scrollIntoView({ block: "nearest" });
  }, [selectedIndex, open]);

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <div className="relative">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => {
            setOpen(true);
            setRecent(loadRecentSearches());
          }}
          placeholder="Search anything…"
          className="h-9 w-full rounded-lg border border-slate-200/90 bg-slate-50/90 pl-8 pr-[4.5rem] text-sm text-slate-800 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-[#2277FF] focus:bg-white focus:ring-2 focus:ring-[#2277FF]/12 dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-100 xl:pr-[5.75rem]"
          aria-label="Search workspace"
          aria-expanded={open}
          aria-autocomplete="list"
          role="combobox"
        />
        <div className="absolute right-1 top-1/2 flex -translate-y-1/2 items-center gap-0.5">
          {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin text-slate-400" /> : null}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpenSearchableFields();
            }}
            aria-label="Searchable fields"
            title="Searchable fields"
            className={searchToolBtn}
          >
            <Settings2 className="h-3 w-3" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpenAdvancedFilters();
            }}
            aria-label="Advanced search"
            title="Advanced search"
            className={cn(
              searchToolBtn,
              advancedFiltersActive && "bg-[#191970]/10 text-[#191970] dark:bg-[#2277FF]/15 dark:text-[#2277FF]",
            )}
          >
            <Filter className="h-3 w-3" />
          </button>
        </div>
      </div>

      {open ? (
        <>
          <div className="fixed inset-0 z-[80] bg-slate-900/20 md:bg-transparent" aria-hidden onClick={() => setOpen(false)} />
          <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-[90] min-w-[min(100vw-2rem,36rem)] md:min-w-[28rem]">
            <ResultsPanel
              query={query}
              loading={loading}
              grouped={grouped}
              flatResults={flatResults}
              selectedIndex={selectedIndex}
              recent={recent}
              onHover={setSelectedIndex}
              onSelect={handleSelect}
              onSelectRecent={(item, index) => {
                setSelectedIndex(index);
                handleSelectRecent(item);
              }}
            />
          </div>
        </>
      ) : null}
    </div>
  );
}
