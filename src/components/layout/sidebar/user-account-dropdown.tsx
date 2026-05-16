"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { 
  User, 
  Blocks, 
  Settings, 
  Users2, 
  LifeBuoy, 
  Moon, 
  Sun, 
  LogOut, 
  Crown,
  KeyRound
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { authStore } from "@/stores/auth.store";
import { ModernModal } from "@/components/shared/modern-modal";
import { ChangePasswordForm } from "@/features/auth/components/change-password-form";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export function UserAccountDropdown({ isOpen, onClose }: Props) {
  const user = authStore((s) => s.user);
  const logout = authStore((s) => s.logout);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle("dark");
  };

  const menuItems = [
    { label: "User Profile", icon: User, href: "/settings/profile" },
    { label: "Change Password", icon: KeyRound, onClick: () => setIsPasswordModalOpen(true) },
    { label: "Integrations", icon: Blocks, href: "/settings/integrations" },
    { label: "Settings", icon: Settings, href: "/settings" },
    { label: "Community", icon: Users2, href: "/community" },
    { label: "Help Center", icon: LifeBuoy, href: "/help" },
  ];

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop for closing */}
            <div 
              className="fixed inset-0 z-40 bg-transparent" 
              onClick={onClose}
            />
            
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
              className={cn(
                "absolute bottom-20 left-4 z-50 w-72 overflow-hidden rounded-[24px] border border-slate-200 bg-white p-4 shadow-2xl",
                "dark:border-slate-800 dark:bg-slate-900"
              )}
            >
              {/* Header */}
              <div className="flex items-center gap-3 px-2 py-3">
                <div className="h-12 w-12 rounded-full bg-gradient-to-tr from-blue-100 to-indigo-100 dark:from-blue-900/40 dark:to-indigo-900/40 flex items-center justify-center text-lg font-bold text-blue-600 uppercase">
                  {user?.fullName?.charAt(0) || user?.email?.charAt(0) || "U"}
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="truncate text-sm font-bold text-slate-900 dark:text-white">
                    {user?.fullName || "Active User"}
                  </p>
                  <p className="truncate text-xs text-slate-500">
                    {user?.email || "user@rivexa.com"}
                  </p>
                </div>
              </div>

              {/* Upgrade Banner */}
              <div className="mt-2 group relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 p-4 shadow-lg shadow-blue-500/20 cursor-pointer transition-transform hover:scale-[1.02] active:scale-[0.98]">
                 <div className="absolute top-[-10px] right-[-10px] h-20 w-20 bg-white/10 blur-2xl rounded-full"></div>
                 <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20 backdrop-blur-md">
                          <Crown className="h-4 w-4 text-white" />
                      </div>
                      <span className="text-sm font-bold text-white">Upgrade profile</span>
                    </div>
                    <div className="rounded-md bg-white/20 px-2 py-1 text-[10px] font-black text-white backdrop-blur-md">
                      PRO
                    </div>
                 </div>
              </div>

              {/* Menu List */}
              <div className="mt-4 space-y-0.5">
                {menuItems.map((item) => (
                  item.href ? (
                    <Link
                      key={item.label}
                      href={item.href}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
                    >
                      <item.icon className="h-4 w-4" />
                      <span className="flex-1 text-left">{item.label}</span>
                    </Link>
                  ) : (
                    <button
                      key={item.label}
                      onClick={item.onClick}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
                    >
                      <item.icon className="h-4 w-4" />
                      <span className="flex-1 text-left">{item.label}</span>
                    </button>
                  )
                ))}
              </div>

              {/* Dark Mode Toggle */}
              <div className="mt-2 border-t border-slate-100 py-2 dark:border-slate-800">
                 <div className="flex items-center justify-between rounded-xl px-3 py-2 text-sm font-semibold text-slate-600 dark:text-slate-400">
                    <div className="flex items-center gap-3">
                      {isDarkMode ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                      <span>Dark Mode</span>
                    </div>
                    <button 
                      onClick={toggleDarkMode}
                      className={cn(
                          "relative h-5 w-9 rounded-full transition-colors duration-300",
                          isDarkMode ? "bg-blue-600" : "bg-slate-200 dark:bg-slate-700"
                      )}
                    >
                      <motion.div 
                          animate={{ x: isDarkMode ? 18 : 2 }}
                          className="absolute top-1 h-3 w-3 rounded-full bg-white shadow-sm"
                      />
                    </button>
                 </div>
              </div>

              {/* Sign Out */}
              <div className="mt-1">
                 <button 
                  onClick={() => logout()}
                  className="flex w-full items-center gap-3 rounded-2xl bg-rose-50/50 px-3 py-3 text-sm font-bold text-rose-600 transition-all hover:bg-rose-50 dark:bg-rose-900/10 dark:text-rose-400 dark:hover:bg-rose-900/20"
                 >
                    <LogOut className="h-4 w-4" />
                    <span>Sign out</span>
                 </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <ModernModal 
        isOpen={isPasswordModalOpen} 
        onClose={() => setIsPasswordModalOpen(false)}
      >
        <ChangePasswordForm 
          isModal 
          onCancel={() => setIsPasswordModalOpen(false)} 
          onSuccess={() => setIsPasswordModalOpen(false)}
        />
      </ModernModal>
    </>
  );
}
