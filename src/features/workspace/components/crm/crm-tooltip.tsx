"use client";

import { ReactNode, useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { cn } from "@/lib/utils/cn";

type Props = {
  label: string;
  children: ReactNode;
  side?: "top" | "bottom";
  className?: string;
};

export function CrmTooltip({ label, children, side = "top", className }: Props) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const triggerRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const updatePosition = useCallback(() => {
    const el = triggerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setCoords({
      x: rect.left + rect.width / 2,
      y: side === "top" ? rect.top - 8 : rect.bottom + 8,
    });
  }, [side]);

  const show = () => {
    updatePosition();
    setOpen(true);
  };

  const hide = () => setOpen(false);

  return (
    <>
      <span
        ref={triggerRef}
        className={cn("inline-flex", className)}
        onMouseEnter={show}
        onMouseLeave={hide}
        onFocus={show}
        onBlur={hide}
      >
        {children}
      </span>
      {mounted && open
        ? createPortal(
            <span
              role="tooltip"
              style={{
                left: coords.x,
                top: coords.y,
                transform: side === "top" ? "translate(-50%, -100%)" : "translate(-50%, 0)",
              }}
              className="pointer-events-none fixed z-[300] w-max max-w-[240px] rounded-md bg-slate-900 px-2.5 py-1.5 text-center text-[11px] font-medium leading-snug text-white shadow-lg"
            >
              {label}
              <span
                className={cn(
                  "absolute left-1/2 h-0 w-0 -translate-x-1/2 border-x-[5px] border-x-transparent",
                  side === "top"
                    ? "top-full border-t-[5px] border-t-slate-900"
                    : "bottom-full border-b-[5px] border-b-slate-900",
                )}
                aria-hidden
              />
            </span>,
            document.body,
          )
        : null}
    </>
  );
}
