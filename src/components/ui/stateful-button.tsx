"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface StatefulButtonProps {
  children: React.ReactNode;
  onClick?: () => void | Promise<void>;
  className?: string;
  disabled?: boolean;
  loadingText?: string;
  successText?: string;
  errorText?: string;
  duration?: number;
}

export const StatefulButton = ({
  children,
  onClick,
  className,
  disabled = false,
  loadingText = "Loading...",
  successText = "Success!",
  errorText = "Error!",
  duration = 2000,
}: StatefulButtonProps) => {
  const [state, setState] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleClick = async () => {
    if (disabled || state === "loading") return;

    setState("loading");
    
    try {
      await onClick?.();
      setState("success");
      setTimeout(() => setState("idle"), duration);
    } catch (error) {
      setState("error");
      setTimeout(() => setState("idle"), duration);
    }
  };

  return (
    <motion.button
      className={cn(
        "relative inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        "bg-primary text-primary-foreground hover:bg-primary/90",
        className
      )}
      onClick={handleClick}
      disabled={disabled || state === "loading"}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <AnimatePresence mode="wait">
        {state === "idle" && (
          <motion.div
            key="idle"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-2"
          >
            {children}
          </motion.div>
        )}
        
        {state === "loading" && (
          <motion.div
            key="loading"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-2"
          >
            <motion.div
              className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
            {loadingText}
          </motion.div>
        )}
        
        {state === "success" && (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="flex items-center gap-2 text-green-600"
          >
            <motion.svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <motion.path
                d="M13.5 4.5L6 12L2.5 8.5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </motion.svg>
            {successText}
          </motion.div>
        )}
        
        {state === "error" && (
          <motion.div
            key="error"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="flex items-center gap-2 text-red-600"
          >
            <motion.svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <motion.path
                d="M12 4L4 12M4 4L12 12"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </motion.svg>
            {errorText}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
};
