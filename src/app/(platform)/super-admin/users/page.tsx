"use client";

import React from "react";
import { motion } from "framer-motion";
import { 
  Users, 
  ShieldCheck, 
  UserCheck, 
  UserX,
  MoreVertical,
  Mail,
  Calendar
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

const users = [
  { id: "1", name: "Alice Admin", email: "alice@rivexa.com", role: "SUPER_ADMIN", status: "ACTIVE", lastSeen: "2 mins ago" },
  { id: "2", name: "Bob Support", email: "bob@rivexa.com", role: "SUPPORT_AGENT", status: "ACTIVE", lastSeen: "1 hour ago" },
  { id: "3", name: "Charlie Billing", email: "charlie@rivexa.com", role: "BILLING_MANAGER", status: "INACTIVE", lastSeen: "3 days ago" },
  { id: "4", name: "Dave Operator", email: "dave@rivexa.com", role: "PLATFORM_OPERATOR", status: "ACTIVE", lastSeen: "5 mins ago" },
];

export default function UsersPage() {
  return (
    <div className="min-h-screen p-6 md:p-10 space-y-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white uppercase">
            Platform <span className="text-blue-600">Users</span>
          </h1>
          <p className="mt-1 text-slate-500">Manage administrative accounts, roles, and platform access permissions.</p>
        </div>
        <button className="rounded-2xl bg-blue-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/20">Add Operator</button>
      </div>

      <div className="overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50/50 dark:bg-slate-950/50 border-b border-slate-100 dark:border-slate-800">
              <th className="px-6 py-4 text-xs font-black uppercase text-slate-400">User / Identity</th>
              <th className="px-6 py-4 text-xs font-black uppercase text-slate-400">Role</th>
              <th className="px-6 py-4 text-xs font-black uppercase text-slate-400">Status</th>
              <th className="px-6 py-4 text-xs font-black uppercase text-slate-400">Last Active</th>
              <th className="px-6 py-4 text-xs font-black uppercase text-slate-400 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
            {users.map((user, i) => (
              <tr key={user.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                <td className="px-6 py-5">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-500">
                      {user.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white">{user.name}</div>
                      <div className="text-xs text-slate-400">{user.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5">
                   <span className={cn("rounded-full px-3 py-1 text-[10px] font-black tracking-widest", user.role === "SUPER_ADMIN" ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700")}>
                    {user.role}
                   </span>
                </td>
                <td className="px-6 py-5">
                   <div className={cn("flex items-center gap-1.5 text-[10px] font-black", user.status === "ACTIVE" ? "text-emerald-500" : "text-slate-400")}>
                    {user.status === "ACTIVE" ? <UserCheck className="h-3.5 w-3.5" /> : <UserX className="h-3.5 w-3.5" />}
                    {user.status}
                   </div>
                </td>
                <td className="px-6 py-5 text-xs font-semibold text-slate-500">{user.lastSeen}</td>
                <td className="px-6 py-5 text-right">
                  <button className="text-slate-400 hover:text-slate-600"><MoreVertical className="h-4 w-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
