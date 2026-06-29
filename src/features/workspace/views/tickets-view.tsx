"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { 
  Ticket, Plus, Send, MessageSquare, AlertCircle, RefreshCw, Clock, 
  CheckCircle, User, Activity, Archive, Trash2, ArrowLeft 
} from "lucide-react";
import { apiClient } from "@/lib/api/client";
import { useHrCompanyId } from "@/features/workspace/hooks/use-hr-company-id";
import { workspaceStore } from "@/stores/workspace.store";

type TicketMessage = {
  id: string;
  message: string;
  sender: { id: string; fullName: string; email: string };
  createdAt: string;
};

type SupportTicket = {
  id: string;
  subject: string;
  description: string;
  status: string;
  priority: string;
  category: string;
  createdAt: string;
  messages?: TicketMessage[];
};

export function TicketsView() {
  const companyId = useHrCompanyId();
  const themeConfig = workspaceStore((s) => s.themeConfig);
  const primaryColor = themeConfig?.primaryColor || "#191970";

  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [loading, setLoading] = useState(true);
  const [createModal, setCreateModal] = useState(false);

  // Form states
  const [newTicket, setNewTicket] = useState({
    subject: "",
    description: "",
    priority: "MEDIUM",
    category: "General"
  });

  const [replyMessage, setReplyMessage] = useState("");
  const [sendingReply, setSendingReply] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const loadTickets = useCallback(async (selectIdAfterLoad?: string) => {
    setLoading(true);
    try {
      const res = await apiClient.get("/support/tickets");
      if (res.data?.success) {
        const fetched = res.data.data || [];
        setTickets(fetched);
        
        // If we should auto-select a ticket (e.g. after adding message or creating)
        if (selectIdAfterLoad) {
          const matched = fetched.find((t: any) => t.id === selectIdAfterLoad);
          if (matched) setSelectedTicket(matched);
        } else if (selectedTicket) {
          const matched = fetched.find((t: any) => t.id === selectedTicket.id);
          if (matched) setSelectedTicket(matched);
        }
      }
    } catch (err) {
      console.error("Failed to load tickets:", err);
    } finally {
      setLoading(false);
    }
  }, [selectedTicket]);

  useEffect(() => {
    loadTickets();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedTicket?.messages]);

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await apiClient.post("/support/tickets", newTicket);
      if (res.data?.success) {
        setCreateModal(false);
        setNewTicket({ subject: "", description: "", priority: "MEDIUM", category: "General" });
        await loadTickets(res.data.data?.id);
      }
    } catch (err) {
      alert("Failed to create ticket");
    }
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !replyMessage.trim()) return;
    setSendingReply(true);
    try {
      const res = await apiClient.post(`/support/tickets/${selectedTicket.id}/messages`, {
        message: replyMessage
      });
      if (res.data?.success) {
        setReplyMessage("");
        // Reload tickets list and update active selected ticket messages
        await loadTickets(selectedTicket.id);
      }
    } catch (err) {
      alert("Failed to send message reply");
    } finally {
      setSendingReply(false);
    }
  };

  const handleCloseTicket = async (ticketId: string) => {
    if (!confirm("Are you sure you want to close this ticket?")) return;
    try {
      const res = await apiClient.put(`/support/tickets/${ticketId}`, {
        status: "CLOSED"
      });
      if (res.data?.success) {
        setSelectedTicket(null);
        loadTickets();
      }
    } catch (err) {
      alert("Failed to close ticket");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/60 pb-4 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Customer Support Tickets</h1>
          <p className="mt-1 text-sm text-slate-500">Raise query requests, monitor unresolved ticket queues, and live chat with support managers.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setCreateModal(true)} className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700">
            <Plus className="h-4 w-4" /> Create Ticket
          </button>
          <button onClick={() => loadTickets()} className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900">
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tickets catalog list */}
        <div className="lg:col-span-1 space-y-4">
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
            <div className="border-b border-slate-100 p-4 bg-slate-50 dark:border-slate-800 dark:bg-slate-850">
              <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Ticket className="h-4 w-4" /> Open Tickets Directory
              </h3>
            </div>
            
            {loading && tickets.length === 0 ? (
              <div className="flex h-48 items-center justify-center">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-[500px] overflow-y-auto">
                {tickets.length === 0 ? (
                  <p className="text-center text-xs text-slate-500 py-12">No support tickets found.</p>
                ) : (
                  tickets.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setSelectedTicket(t)}
                      className={`w-full text-left p-4 hover:bg-slate-50 transition-colors flex flex-col gap-1.5 border-l-4 ${selectedTicket?.id === t.id ? "bg-indigo-50/40 border-indigo-600" : "border-transparent"}`}
                    >
                      <div className="flex justify-between items-start w-full">
                        <span className="text-xs font-bold text-slate-400 font-mono">TKT-{t.id.slice(-5).toUpperCase()}</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${t.status === "OPEN" ? "bg-amber-100 text-amber-800" : t.status === "CLOSED" ? "bg-slate-100 text-slate-700" : "bg-indigo-100 text-indigo-800"}`}>
                          {t.status}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-850 dark:text-white line-clamp-1">{t.subject}</h4>
                      <p className="text-xs text-slate-500 line-clamp-2">{t.description}</p>
                      <div className="flex justify-between items-center w-full mt-1">
                        <span className="text-[10px] text-slate-400 bg-slate-100 px-1 rounded uppercase font-bold">{t.category}</span>
                        <span className={`text-[10px] font-bold ${t.priority === "URGENT" || t.priority === "HIGH" ? "text-red-600" : "text-slate-500"}`}>{t.priority}</span>
                      </div>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {/* Live chat conversation thread */}
        <div className="lg:col-span-2">
          {selectedTicket ? (
            <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 flex flex-col h-[560px]">
              {/* Ticket Details Header */}
              <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-850">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    {selectedTicket.subject}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">Category: <span className="font-bold">{selectedTicket.category}</span> | Priority: <span className="font-bold">{selectedTicket.priority}</span></p>
                </div>
                {selectedTicket.status !== "CLOSED" && (
                  <button onClick={() => handleCloseTicket(selectedTicket.id)} className="flex items-center gap-1 text-xs border border-red-200 text-red-600 px-2.5 py-1.5 rounded-lg bg-red-50/50 hover:bg-red-50 font-semibold">
                    <Archive className="h-3.5 w-3.5" /> Close Ticket
                  </button>
                )}
              </div>

              {/* Chat view area */}
              <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50/50 dark:bg-slate-950/20">
                {/* Description Box */}
                <div className="p-4 rounded-xl bg-indigo-50/40 border border-indigo-100/50 dark:bg-slate-800 dark:border-slate-800">
                  <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 block uppercase mb-1">Ticket Issue Description</span>
                  <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{selectedTicket.description}</p>
                  <span className="text-[10px] text-slate-400 block mt-2">{new Date(selectedTicket.createdAt).toLocaleString()}</span>
                </div>

                {/* Message items list */}
                {(selectedTicket.messages || []).map((msg) => (
                  <div key={msg.id} className="flex flex-col space-y-1">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      <User className="h-3 w-3" />
                      <span className="font-bold">{msg.sender.fullName}</span>
                      <span className="text-[10px] text-slate-400 font-mono">({msg.sender.email})</span>
                    </div>
                    <div className="p-3 rounded-xl bg-white border border-slate-100 shadow-sm max-w-xl text-sm text-slate-800 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-200">
                      {msg.message}
                    </div>
                    <span className="text-[9px] text-slate-400 pl-1">{new Date(msg.createdAt).toLocaleTimeString()}</span>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>

              {/* Input Area */}
              {selectedTicket.status !== "CLOSED" ? (
                <form onSubmit={handleSendReply} className="p-3 border-t border-slate-100 dark:border-slate-800 flex gap-2">
                  <input
                    required
                    type="text"
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    placeholder="Type your message here to live chat..."
                    className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:border-indigo-600 dark:border-slate-800 dark:bg-slate-800"
                  />
                  <button type="submit" disabled={sendingReply || !replyMessage.trim()} className="flex items-center justify-center h-9 w-9 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50">
                    <Send className="h-4 w-4" />
                  </button>
                </form>
              ) : (
                <div className="p-3 bg-slate-100 text-center text-xs text-slate-500 font-semibold border-t dark:bg-slate-850">
                  This ticket has been resolved and closed. Live chat is disabled.
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-slate-200 dark:border-slate-800 h-[560px] flex flex-col items-center justify-center p-6 text-center text-slate-400">
              <MessageSquare className="h-12 w-12 text-slate-300 mb-2" />
              <h3 className="font-bold text-slate-700 dark:text-slate-300">No Ticket Selected</h3>
              <p className="text-xs text-slate-500 max-w-sm mt-1">Select an active ticket from the directory or create a new query to start dynamic live chatting with managers.</p>
            </div>
          )}
        </div>
      </div>

      {/* Create Ticket Modal */}
      {createModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <form onSubmit={handleCreateTicket} className="w-full max-w-md rounded-xl bg-white p-6 dark:bg-slate-900 space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Raise Support Ticket</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500">Ticket Subject</label>
                <input required type="text" value={newTicket.subject} onChange={e => setNewTicket(p => ({ ...p, subject: e.target.value }))} className="mt-1 w-full rounded-lg border border-slate-200 p-2.5 dark:border-slate-800" placeholder="e.g. Invoicing error / API connection down" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500">Category</label>
                  <select value={newTicket.category} onChange={e => setNewTicket(p => ({ ...p, category: e.target.value }))} className="mt-1 w-full rounded-lg border border-slate-200 p-2.5 dark:border-slate-800 dark:bg-slate-800">
                    <option value="General">General</option>
                    <option value="Billing">Billing</option>
                    <option value="Sales">Sales</option>
                    <option value="Technical">Technical</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500">Priority</label>
                  <select value={newTicket.priority} onChange={e => setNewTicket(p => ({ ...p, priority: e.target.value }))} className="mt-1 w-full rounded-lg border border-slate-200 p-2.5 dark:border-slate-800 dark:bg-slate-800">
                    <option value="LOW">LOW</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HIGH">HIGH</option>
                    <option value="URGENT">URGENT</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500">Detailed Description</label>
                <textarea required rows={4} value={newTicket.description} onChange={e => setNewTicket(p => ({ ...p, description: e.target.value }))} className="mt-1 w-full rounded-lg border border-slate-200 p-2.5 dark:border-slate-800" placeholder="Provide full details of the issue you are experiencing..." />
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t pt-4">
              <button type="button" onClick={() => setCreateModal(false)} className="rounded-lg px-4 py-2 text-sm border border-slate-200 hover:bg-slate-50">Cancel</button>
              <button type="submit" className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700">Submit Ticket</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
