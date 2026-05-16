"use client";

import React, { useState, useMemo } from "react";
import { Eye, EyeOff, Lock, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils/cn";
import { changePassword } from "@/lib/api/auth";
import { authStore } from "@/stores/auth.store";

interface Props {
  onSuccess?: () => void;
  onCancel?: () => void;
  isModal?: boolean;
}

export function ChangePasswordForm({ onSuccess, onCancel, isModal }: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Password strength calculation
  const strength = useMemo(() => {
    const pw = formData.newPassword;
    if (!pw) return 0;
    let score = 0;
    if (pw.length >= 8) score += 1;
    if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score += 1;
    if (/[0-9]/.test(pw)) score += 1;
    if (/[^a-zA-Z0-9]/.test(pw)) score += 1;
    return score;
  }, [formData.newPassword]);

  const strengthColor = [
    "bg-slate-200",
    "bg-rose-500",
    "bg-amber-500",
    "bg-blue-500",
    "bg-emerald-500"
  ][strength];

  const strengthText = [
    "",
    "Weak",
    "Fair",
    "Good",
    "Strong"
  ][strength];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.newPassword !== formData.confirmPassword) {
      setError("New passwords do not match.");
      return;
    }
    if (strength < 2) {
      setError("Password is too weak.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await changePassword({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      });
      setSuccess(true);
      setTimeout(() => {
        authStore.getState().logout();
        onSuccess?.();
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Failed to change password.");
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center py-12 text-center"
      >
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
          <CheckCircle2 className="h-10 w-10" />
        </div>
        <h3 className="text-xl font-bold text-slate-900">Password Changed!</h3>
        <p className="mt-2 text-slate-500">Your password has been updated successfully. Redirecting to login...</p>
      </motion.div>
    );
  }

  return (
    <div className={cn("w-full", isModal ? "max-w-md" : "max-w-2xl")}>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900">Change password</h2>
        <p className="mt-1 text-sm text-slate-500">Use at least 8 characters. A mix of letters, numbers and symbols is recommended.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Current Password */}
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700">Current password</label>
          <div className="relative">
            <input
              required
              type={showCurrent ? "text" : "password"}
              value={formData.currentPassword}
              onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3.5 pr-12 outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
              placeholder="Enter your current password"
            />
            <button
              type="button"
              onClick={() => setShowCurrent(!showCurrent)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              {showCurrent ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* New Password */}
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700">New password</label>
          <div className="relative">
            <input
              required
              type={showNew ? "text" : "password"}
              value={formData.newPassword}
              onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3.5 pr-12 outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
              placeholder="At least 8 characters"
            />
            <button
              type="button"
              onClick={() => setShowNew(!showNew)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              {showNew ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
          
          {/* Strength Meter */}
          <div className="mt-3 space-y-2">
            <div className="flex gap-1.5">
              {[1, 2, 3, 4].map((step) => (
                <div 
                  key={step} 
                  className={cn(
                    "h-1.5 flex-1 rounded-full transition-all duration-500",
                    strength >= step ? strengthColor : "bg-slate-100 dark:bg-slate-800"
                  )} 
                />
              ))}
            </div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
               {strengthText ? `${strengthText} strength` : "Strength meter updates as you type."}
            </p>
          </div>
        </div>

        {/* Confirm Password */}
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700">Confirm new password</label>
          <div className="relative">
            <input
              required
              type={showConfirm ? "text" : "password"}
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3.5 pr-12 outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
              placeholder="Re-enter your new password"
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              {showConfirm ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 rounded-xl bg-rose-50 p-4 text-sm font-semibold text-rose-600 dark:bg-rose-900/10 dark:text-rose-400"
          >
            <AlertCircle className="h-5 w-5 shrink-0" />
            <p>{error}</p>
          </motion.div>
        )}

        <div className="flex items-center gap-4 pt-2">
          <button
            type="submit"
            disabled={isLoading}
            className="rounded-xl bg-[#0f172a] px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-slate-900/20 transition-all hover:bg-slate-800 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70"
          >
            {isLoading ? "Updating..." : "Update password"}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
