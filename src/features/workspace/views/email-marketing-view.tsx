"use client";

import { useEffect, useState } from "react";
import { Mail, Plus, Users, Layout, Send, Trash2, Eye, FileText, CheckCircle, RefreshCw } from "lucide-react";
import { apiClient } from "@/lib/api/client";
import { useHrCompanyId } from "@/features/workspace/hooks/use-hr-company-id";

export function EmailMarketingView() {
  const companyId = useHrCompanyId();
  const [activeTab, setActiveTab] = useState<"campaigns" | "lists" | "templates">("campaigns");
  const [templates, setTemplates] = useState<any[]>([]);
  const [lists, setLists] = useState<any[]>([]);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal / Form States
  const [templateModal, setTemplateModal] = useState(false);
  const [listModal, setListModal] = useState(false);
  const [campaignModal, setCampaignModal] = useState(false);
  
  const [newTemplate, setNewTemplate] = useState({ name: "", subject: "", bodyHtml: "" });
  const [newList, setNewList] = useState({ name: "", description: "" });
  const [newCampaign, setNewCampaign] = useState({ name: "", subject: "", templateId: "", listId: "" });

  const loadData = async () => {
    if (!companyId) return;
    setLoading(true);
    setError(null);
    try {
      const [tplRes, listRes, campRes] = await Promise.all([
        apiClient.get(`/email-marketing/templates/${companyId}`).catch(() => ({ data: { data: [] } })),
        apiClient.get(`/email-marketing/lists/${companyId}`).catch(() => ({ data: { data: [] } })),
        apiClient.get(`/email-marketing/campaigns/${companyId}`).catch(() => ({ data: { data: [] } })),
      ]);
      setTemplates(tplRes.data.data || []);
      setLists(listRes.data.data || []);
      setCampaigns(campRes.data.data || []);
    } catch (err: any) {
      setError(err.message || "Failed to load Email Marketing data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [companyId]);

  const handleCreateTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.post("/email-marketing/templates", {
        ...newTemplate,
        companyId,
        designJson: {}
      });
      setTemplateModal(false);
      setNewTemplate({ name: "", subject: "", bodyHtml: "" });
      loadData();
    } catch (err: any) {
      alert("Failed to create template: " + err.message);
    }
  };

  const handleCreateList = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.post("/email-marketing/lists", {
        ...newList,
        companyId
      });
      setListModal(false);
      setNewList({ name: "", description: "" });
      loadData();
    } catch (err: any) {
      alert("Failed to create list: " + err.message);
    }
  };

  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.post("/email-marketing/campaigns", {
        ...newCampaign,
        companyId
      });
      setCampaignModal(false);
      setNewCampaign({ name: "", subject: "", templateId: "", listId: "" });
      loadData();
    } catch (err: any) {
      alert("Failed to create campaign: " + err.message);
    }
  };

  const handleSendCampaign = async (id: string) => {
    try {
      await apiClient.post(`/email-marketing/campaigns/${id}/send`);
      alert("Campaign delivery initialized!");
      loadData();
    } catch (err: any) {
      alert("Send failed: " + err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/60 pb-4 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Email Marketing</h1>
          <p className="mt-1 text-sm text-slate-500">Design beautiful email templates, organize subscribers, and send target campaigns.</p>
        </div>
        <div className="flex gap-2">
          {activeTab === "campaigns" && (
            <button onClick={() => setCampaignModal(true)} className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700">
              <Plus className="h-4 w-4" /> Create Campaign
            </button>
          )}
          {activeTab === "lists" && (
            <button onClick={() => setListModal(true)} className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700">
              <Plus className="h-4 w-4" /> Create List
            </button>
          )}
          {activeTab === "templates" && (
            <button onClick={() => setTemplateModal(true)} className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700">
              <Plus className="h-4 w-4" /> Create Template
            </button>
          )}
          <button onClick={loadData} className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900">
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Tabs list */}
      <div className="flex gap-4 border-b border-slate-200 dark:border-slate-800">
        <button onClick={() => setActiveTab("campaigns")} className={`pb-3 text-sm font-semibold ${activeTab === "campaigns" ? "border-b-2 border-indigo-600 text-indigo-600" : "text-slate-500 hover:text-slate-900"}`}>
          Campaigns
        </button>
        <button onClick={() => setActiveTab("lists")} className={`pb-3 text-sm font-semibold ${activeTab === "lists" ? "border-b-2 border-indigo-600 text-indigo-600" : "text-slate-500 hover:text-slate-900"}`}>
          Subscriber Lists
        </button>
        <button onClick={() => setActiveTab("templates")} className={`pb-3 text-sm font-semibold ${activeTab === "templates" ? "border-b-2 border-indigo-600 text-indigo-600" : "text-slate-500 hover:text-slate-900"}`}>
          Templates
        </button>
      </div>

      {/* Tab Panels */}
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
        </div>
      ) : (
        <div>
          {/* Campaigns tab */}
          {activeTab === "campaigns" && (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {campaigns.length === 0 ? (
                <div className="col-span-full rounded-xl border border-dashed border-slate-300 p-12 text-center dark:border-slate-800">
                  <Mail className="mx-auto h-12 w-12 text-slate-400" />
                  <h3 className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">No campaigns found</h3>
                  <p className="mt-2 text-sm text-slate-500">Launch your first newsletter or automated email sequence.</p>
                </div>
              ) : (
                campaigns.map((camp) => (
                  <div key={camp.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex items-start justify-between">
                      <h3 className="font-bold text-slate-950 dark:text-white">{camp.name}</h3>
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${camp.status === "SENT" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}>
                        {camp.status}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-slate-500">Subject: {camp.subject}</p>
                    <div className="mt-4 flex gap-4 text-xs text-slate-500">
                      <div>Sent: <strong>{camp.sentCount || 0}</strong></div>
                      <div>Opened: <strong>{camp.openedCount || 0}</strong></div>
                    </div>
                    <div className="mt-5 flex justify-end gap-2">
                      {camp.status !== "SENT" && (
                        <button onClick={() => handleSendCampaign(camp.id)} className="flex items-center gap-1 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700">
                          <Send className="h-3 w-3" /> Send Now
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Subscriber lists */}
          {activeTab === "lists" && (
            <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                  <tr>
                    <th className="px-6 py-4">List Name</th>
                    <th className="px-6 py-4">Description</th>
                    <th className="px-6 py-4">Subscribers Count</th>
                    <th className="px-6 py-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {lists.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-slate-500">No subscriber lists registered yet.</td>
                    </tr>
                  ) : (
                    lists.map((list) => (
                      <tr key={list.id} className="hover:bg-slate-50 dark:hover:bg-slate-850">
                        <td className="px-6 py-4 font-semibold text-slate-900 dark:text-white">{list.name}</td>
                        <td className="px-6 py-4 text-slate-500">{list.description || "—"}</td>
                        <td className="px-6 py-4 font-bold">{list.subscribers?.length || 0}</td>
                        <td className="px-6 py-4">
                          <button className="text-indigo-600 hover:text-indigo-900">View/Add Users</button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Templates */}
          {activeTab === "templates" && (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {templates.length === 0 ? (
                <div className="col-span-full rounded-xl border border-dashed border-slate-300 p-12 text-center dark:border-slate-800">
                  <Layout className="mx-auto h-12 w-12 text-slate-400" />
                  <h3 className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">No email templates design</h3>
                  <p className="mt-2 text-sm text-slate-500">Create HTML block-based templates for standard campaigns.</p>
                </div>
              ) : (
                templates.map((tpl) => (
                  <div key={tpl.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                    <h3 className="font-bold text-slate-950 dark:text-white">{tpl.name}</h3>
                    <p className="mt-1.5 text-xs text-slate-500">Subject Line: {tpl.subject}</p>
                    <div className="mt-4 rounded border border-slate-100 bg-slate-50 p-3 dark:border-slate-850 dark:bg-slate-800">
                      <div className="line-clamp-3 text-xs font-mono text-slate-500" dangerouslySetInnerHTML={{ __html: tpl.bodyHtml || "No content" }} />
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}

      {/* Modals definition */}
      {templateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <form onSubmit={handleCreateTemplate} className="w-full max-w-lg rounded-xl bg-white p-6 dark:bg-slate-900">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Create Email Template</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500">Template Name</label>
                <input required type="text" value={newTemplate.name} onChange={e => setNewTemplate(p => ({ ...p, name: e.target.value }))} className="mt-1 w-full rounded-lg border border-slate-200 p-2.5 dark:border-slate-800" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500">Subject</label>
                <input required type="text" value={newTemplate.subject} onChange={e => setNewTemplate(p => ({ ...p, subject: e.target.value }))} className="mt-1 w-full rounded-lg border border-slate-200 p-2.5 dark:border-slate-800" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500">Template HTML Body</label>
                <textarea required rows={5} value={newTemplate.bodyHtml} onChange={e => setNewTemplate(p => ({ ...p, bodyHtml: e.target.value }))} className="mt-1 w-full rounded-lg border border-slate-200 p-2.5 font-mono text-xs dark:border-slate-800" placeholder="&lt;p&gt;Hello User,&lt;/p&gt;" />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={() => setTemplateModal(false)} className="rounded-lg px-4 py-2 text-sm border border-slate-200 hover:bg-slate-50">Cancel</button>
              <button type="submit" className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700">Save Template</button>
            </div>
          </form>
        </div>
      )}

      {listModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <form onSubmit={handleCreateList} className="w-full max-w-md rounded-xl bg-white p-6 dark:bg-slate-900">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Create Subscriber List</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500">List Name</label>
                <input required type="text" value={newList.name} onChange={e => setNewList(p => ({ ...p, name: e.target.value }))} className="mt-1 w-full rounded-lg border border-slate-200 p-2.5 dark:border-slate-800" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500">Description</label>
                <input type="text" value={newList.description} onChange={e => setNewList(p => ({ ...p, description: e.target.value }))} className="mt-1 w-full rounded-lg border border-slate-200 p-2.5 dark:border-slate-800" />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={() => setListModal(false)} className="rounded-lg px-4 py-2 text-sm border border-slate-200 hover:bg-slate-50">Cancel</button>
              <button type="submit" className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700">Create List</button>
            </div>
          </form>
        </div>
      )}

      {campaignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <form onSubmit={handleCreateCampaign} className="w-full max-w-md rounded-xl bg-white p-6 dark:bg-slate-900">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Create Campaign</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500">Campaign Name</label>
                <input required type="text" value={newCampaign.name} onChange={e => setNewCampaign(p => ({ ...p, name: e.target.value }))} className="mt-1 w-full rounded-lg border border-slate-200 p-2.5 dark:border-slate-800" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500">Email Subject Line</label>
                <input required type="text" value={newCampaign.subject} onChange={e => setNewCampaign(p => ({ ...p, subject: e.target.value }))} className="mt-1 w-full rounded-lg border border-slate-200 p-2.5 dark:border-slate-800" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500">Template</label>
                <select required value={newCampaign.templateId} onChange={e => setNewCampaign(p => ({ ...p, templateId: e.target.value }))} className="mt-1 w-full rounded-lg border border-slate-200 p-2.5 dark:border-slate-800 dark:bg-slate-800">
                  <option value="">Select Template</option>
                  {templates.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500">Target List</label>
                <select required value={newCampaign.listId} onChange={e => setNewCampaign(p => ({ ...p, listId: e.target.value }))} className="mt-1 w-full rounded-lg border border-slate-200 p-2.5 dark:border-slate-800 dark:bg-slate-800">
                  <option value="">Select List</option>
                  {lists.map(l => (
                    <option key={l.id} value={l.id}>{l.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={() => setCampaignModal(false)} className="rounded-lg px-4 py-2 text-sm border border-slate-200 hover:bg-slate-50">Cancel</button>
              <button type="submit" className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700">Save Campaign</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
