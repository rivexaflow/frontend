import { ChangePasswordForm } from "@/features/auth/components/change-password-form";

export default function WorkspacePasswordPage() {
  return (
    <div className="mx-auto max-w-4xl py-10 px-6">
      <div className="mb-10 border-b border-slate-200 pb-6 dark:border-slate-800">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Account Settings</h1>
        <p className="mt-2 text-slate-500">Manage your password and security preferences.</p>
      </div>
      
      <div className="rounded-[32px] border border-slate-200 bg-white p-10 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <ChangePasswordForm />
      </div>
    </div>
  );
}
