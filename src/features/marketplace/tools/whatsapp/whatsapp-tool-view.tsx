"use client";

import React, { useState, useEffect } from "react";
import { 
  MessageSquare, 
  QrCode, 
  Users, 
  ShieldCheck, 
  Send, 
  PhoneCall, 
  CheckCircle2, 
  RefreshCw, 
  LogOut, 
  Search, 
  Building2, 
  Lock, 
  UserPlus,
  Wifi
} from "lucide-react";

interface ChatThread {
  clientPhone: string;
  leadName: string;
  leadStage: string;
  leadId: string | null;
  lastMessage: string;
  lastTimestamp: string;
  unreadCount: number;
}

interface ChatMessage {
  id: string;
  sender: string;
  receiver: string;
  body: string;
  direction: "INBOUND" | "OUTBOUND";
  timestamp: string;
}

export function WhatsappToolView() {
  const [activeTab, setActiveTab] = useState<"chat" | "connection" | "assignment">("chat");
  const [connectionStatus, setConnectionStatus] = useState<"CONNECTED" | "DISCONNECTED" | "QR_READY">("CONNECTED");
  const [phoneNumber, setPhoneNumber] = useState("+91 98765 43210");
  const [qrCodeData, setQrCodeData] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Team Members for Assignment (Department Head feature)
  const [teamMembers, setTeamMembers] = useState([
    { id: "user_1", name: "Rahul Sharma", role: "Sales Executive", department: "Sales", assigned: true },
    { id: "user_2", name: "Priya Patel", role: "Lead Nurturer", department: "Sales", assigned: true },
    { id: "user_3", name: "Amit Verma", role: "Account Manager", department: "CRM", assigned: false },
    { id: "user_4", name: "Sneha Gupta", role: "Support Specialist", department: "Support", assigned: false }
  ]);

  // Chats list filtered by hierarchy
  const [chats, setChats] = useState<ChatThread[]>([
    {
      clientPhone: "+91 98123 45678",
      leadName: "Vikram Malhotra (Real Estate Buyer)",
      leadStage: "Proposal Sent",
      leadId: "lead_101",
      lastMessage: "Sir, please send the revised pricing spreadsheet for the 3BHK penthouse.",
      lastTimestamp: "10:42 AM",
      unreadCount: 1
    },
    {
      clientPhone: "+91 97890 12345",
      leadName: "Ananya Roy (Enterprise Lead)",
      leadStage: "Qualified",
      leadId: "lead_102",
      lastMessage: "Yes, our department head will join the demo call tomorrow at 3 PM.",
      lastTimestamp: "Yesterday",
      unreadCount: 0
    },
    {
      clientPhone: "+91 96543 21098",
      leadName: "Karan Mehta (Import Deal)",
      leadStage: "Negotiation",
      leadId: "lead_103",
      lastMessage: "Did you verify the shipment customs declaration document?",
      lastTimestamp: "Jun 26",
      unreadCount: 0
    }
  ]);

  const [selectedChat, setSelectedChat] = useState<ChatThread | null>(chats[0]);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: "m1", sender: "+91 98123 45678", receiver: "+91 98765 43210", body: "Hello! I saw your property listing on the portal.", direction: "INBOUND", timestamp: "10:30 AM" },
    { id: "m2", sender: "+91 98765 43210", receiver: "+91 98123 45678", body: "Hi Vikram! Thank you for contacting Rivexa Flow. How can I assist you today?", direction: "OUTBOUND", timestamp: "10:32 AM" },
    { id: "m3", sender: "+91 98123 45678", receiver: "+91 98765 43210", body: "Sir, please send the revised pricing spreadsheet for the 3BHK penthouse.", direction: "INBOUND", timestamp: "10:42 AM" }
  ]);

  const [newMessageText, setNewMessageText] = useState("");

  const handleGenerateQR = async () => {
    setLoading(true);
    setTimeout(() => {
      setConnectionStatus("QR_READY");
      setQrCodeData("2@RivexaFlowWhatsAppSecretToken_Simulated_QR_String");
      setLoading(false);
    }, 800);
  };

  const handleSimulateScan = async () => {
    setLoading(true);
    setTimeout(() => {
      setConnectionStatus("CONNECTED");
      setPhoneNumber("+91 98765 43210");
      setQrCodeData(null);
      setLoading(false);
    }, 1000);
  };

  const handleDisconnect = () => {
    setConnectionStatus("DISCONNECTED");
  };

  const handleToggleAssignment = (memberId: string) => {
    setTeamMembers(teamMembers.map(m => m.id === memberId ? { ...m, assigned: !m.assigned } : m));
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessageText.trim() || !selectedChat) return;

    const newMsg: ChatMessage = {
      id: `m_${Date.now()}`,
      sender: phoneNumber,
      receiver: selectedChat.clientPhone,
      body: newMessageText.trim(),
      direction: "OUTBOUND",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages([...messages, newMsg]);
    setChats(chats.map(c => c.clientPhone === selectedChat.clientPhone ? { ...c, lastMessage: newMsg.body, lastTimestamp: newMsg.timestamp } : c));
    setNewMessageText("");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* TOP NAVIGATION HEADER */}
      <div className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-white">WhatsApp Business CRM Hub</h1>
              <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs px-2.5 py-0.5 rounded-full font-semibold flex items-center gap-1">
                <Wifi className="w-3 h-3 animate-pulse" /> Live API
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Hierarchy-protected client messaging with permanent database backup
            </p>
          </div>
        </div>

        {/* Action Tabs & Connection Pill */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
          <div className="flex items-center bg-slate-950 border border-slate-800 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab("chat")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === "chat" ? "bg-indigo-600 text-white shadow" : "text-slate-400 hover:text-white"
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" /> Client Chats
            </button>
            <button
              onClick={() => setActiveTab("assignment")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === "assignment" ? "bg-indigo-600 text-white shadow" : "text-slate-400 hover:text-white"
              }`}
            >
              <Users className="w-3.5 h-3.5" /> Team Assignments
            </button>
            <button
              onClick={() => setActiveTab("connection")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === "connection" ? "bg-indigo-600 text-white shadow" : "text-slate-400 hover:text-white"
              }`}
            >
              <QrCode className="w-3.5 h-3.5" /> QR Connection
            </button>
          </div>

          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs">
            <span className={`w-2.5 h-2.5 rounded-full ${connectionStatus === "CONNECTED" ? "bg-emerald-400 animate-ping" : "bg-red-400"}`} />
            <span className="font-semibold text-slate-300">{connectionStatus === "CONNECTED" ? phoneNumber : "Offline"}</span>
          </div>
        </div>
      </div>

      {/* BAN SECURITY BANNER */}
      <div className="bg-emerald-950/40 border-b border-emerald-500/20 px-6 py-2 flex items-center justify-between text-xs text-emerald-300">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>
            <strong className="text-white">Permanent Storage Guaranteed:</strong> All WhatsApp chats and lead interactions are continuously synced and backed up to your Rivexa database. Chat records remain 100% safe even if WhatsApp bans or disconnects your phone.
          </span>
        </div>
        <span className="hidden md:inline font-medium text-emerald-400/80 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
          CRM Lead Hierarchy Access Enforced
        </span>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex overflow-hidden">
        {/* TAB 1: CLIENT CHATS */}
        {activeTab === "chat" && (
          <div className="flex-1 flex overflow-hidden">
            {/* CHAT THREADS SIDEBAR */}
            <div className="w-full md:w-80 lg:w-96 bg-slate-900/90 border-r border-slate-800 flex flex-col shrink-0">
              <div className="p-4 border-b border-slate-800">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Filter hierarchy client chats..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto divide-y divide-slate-800/60">
                {chats.map(chat => {
                  const isSelected = selectedChat?.clientPhone === chat.clientPhone;
                  return (
                    <button
                      key={chat.clientPhone}
                      onClick={() => setSelectedChat(chat)}
                      className={`w-full text-left p-4 transition-colors flex items-start gap-3 ${
                        isSelected ? "bg-indigo-600/10 border-l-4 border-indigo-500" : "hover:bg-slate-800/40"
                      }`}
                    >
                      <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-indigo-400 shrink-0 mt-0.5">
                        {chat.leadName.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <h4 className="font-semibold text-sm text-white truncate">{chat.leadName}</h4>
                          <span className="text-[10px] text-slate-500 shrink-0">{chat.lastTimestamp}</span>
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-xs text-slate-400 truncate">{chat.lastMessage}</p>
                          {chat.unreadCount > 0 && (
                            <span className="w-4 h-4 rounded-full bg-emerald-500 text-slate-950 font-bold text-[10px] flex items-center justify-center shrink-0">
                              {chat.unreadCount}
                            </span>
                          )}
                        </div>
                        <span className="inline-block mt-1.5 text-[10px] font-medium bg-slate-800 text-indigo-300 px-2 py-0.5 rounded border border-slate-700">
                          {chat.leadStage}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* CHAT MESSAGES PANEL */}
            <div className="flex-1 bg-slate-950 flex flex-col h-full overflow-hidden">
              {selectedChat ? (
                <>
                  {/* Active Chat Header */}
                  <div className="bg-slate-900 border-b border-slate-800 px-6 py-3.5 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center font-bold text-indigo-400">
                        {selectedChat.leadName.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-bold text-sm text-white flex items-center gap-2">
                          {selectedChat.leadName}
                          <span className="text-xs font-normal text-slate-400">({selectedChat.clientPhone})</span>
                        </h3>
                        <div className="flex items-center gap-2 text-[11px] text-slate-400">
                          <span className="text-emerald-400 font-medium">Synced CRM Lead</span> • <span>Stage: {selectedChat.leadStage}</span>
                        </div>
                      </div>
                    </div>

                    <button className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 flex items-center gap-1.5">
                      <PhoneCall className="w-3.5 h-3.5 text-indigo-400" /> CRM Call
                    </button>
                  </div>

                  {/* Message History Stream */}
                  <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-slate-950 via-slate-900/40 to-slate-950">
                    <div className="text-center my-2">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 bg-slate-900 px-3 py-1 rounded-full border border-slate-800">
                        🔒 End-to-End Synced to CRM DB
                      </span>
                    </div>

                    {messages.map(msg => {
                      const isMe = msg.direction === "OUTBOUND";
                      return (
                        <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                          <div className={`max-w-md rounded-2xl p-4 text-xs shadow-lg ${
                            isMe 
                              ? "bg-indigo-600 text-white rounded-br-none" 
                              : "bg-slate-900 border border-slate-800 text-slate-200 rounded-bl-none"
                          }`}>
                            <p className="leading-relaxed text-sm">{msg.body}</p>
                            <div className={`text-[10px] mt-2 flex items-center justify-end gap-1 ${isMe ? "text-indigo-200" : "text-slate-500"}`}>
                              <span>{msg.timestamp}</span>
                              {isMe && <CheckCircle2 className="w-3 h-3 text-emerald-300" />}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Input Box */}
                  <form onSubmit={handleSendMessage} className="p-4 bg-slate-900 border-t border-slate-800 flex items-center gap-3 shrink-0">
                    <input
                      type="text"
                      placeholder={`Reply to ${selectedChat.leadName}...`}
                      value={newMessageText}
                      onChange={(e) => setNewMessageText(e.target.value)}
                      className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                    <button
                      type="submit"
                      disabled={!newMessageText.trim()}
                      className="px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold text-sm flex items-center gap-2 transition-all shadow-lg shadow-emerald-600/20"
                    >
                      <span>Send</span> <Send className="w-4 h-4" />
                    </button>
                  </form>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center p-8 text-center text-slate-500">
                  Select a client chat thread from the hierarchy panel to view conversation.
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: DEPARTMENT HEAD TEAM ASSIGNMENT */}
        {activeTab === "assignment" && (
          <div className="flex-1 p-8 overflow-y-auto max-w-4xl mx-auto w-full">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl mb-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Users className="w-5 h-5 text-indigo-400" /> Department Head Team Assignment
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Assign which team members can access and chat with client leads using this connected WhatsApp Business number.
                  </p>
                </div>
                <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-3 py-1 rounded-xl text-xs font-semibold">
                  Department Head Controls
                </span>
              </div>

              <div className="space-y-3">
                {teamMembers.map(member => (
                  <div key={member.id} className="flex items-center justify-between p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition-all">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center font-bold text-indigo-400">
                        {member.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm text-white">{member.name}</h4>
                        <div className="flex items-center gap-2 text-xs text-slate-400">
                          <span>{member.role}</span> • <span className="text-indigo-400">{member.department} Dept</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleToggleAssignment(member.id)}
                      className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                        member.assigned
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30"
                          : "bg-slate-800 text-slate-300 hover:bg-indigo-600 hover:text-white"
                      }`}
                    >
                      {member.assigned ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Assigned to WhatsApp
                        </>
                      ) : (
                        <>
                          <UserPlus className="w-3.5 h-3.5" /> Assign Access
                        </>
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: QR CODE CONNECTION MODAL/PANEL */}
        {activeTab === "connection" && (
          <div className="flex-1 p-8 overflow-y-auto max-w-2xl mx-auto w-full">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl text-center">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-4">
                <QrCode className="w-8 h-8" />
              </div>

              <h2 className="text-2xl font-extrabold text-white mb-2">WhatsApp Business API Connection</h2>
              <p className="text-xs text-slate-400 max-w-md mx-auto mb-6">
                Link your company's WhatsApp Business account via Web QR code authentication to enable CRM team chat.
              </p>

              {connectionStatus === "CONNECTED" && (
                <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-6 mb-6">
                  <div className="flex items-center justify-center gap-2 text-emerald-400 font-bold text-lg mb-1">
                    <CheckCircle2 className="w-5 h-5" /> Active WhatsApp Session
                  </div>
                  <p className="text-xs text-slate-300">Connected Phone Number: <strong className="text-white">{phoneNumber}</strong></p>
                  <div className="mt-4 pt-4 border-t border-emerald-500/20 flex justify-center">
                    <button
                      onClick={handleDisconnect}
                      className="px-4 py-2 rounded-xl bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20 text-xs font-semibold flex items-center gap-1.5"
                    >
                      <LogOut className="w-3.5 h-3.5" /> Disconnect WhatsApp Session
                    </button>
                  </div>
                </div>
              )}

              {connectionStatus === "DISCONNECTED" && (
                <div className="space-y-4">
                  <button
                    onClick={handleGenerateQR}
                    disabled={loading}
                    className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition-all shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2"
                  >
                    {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <QrCode className="w-4 h-4" />}
                    <span>Generate WhatsApp Login QR Code</span>
                  </button>
                </div>
              )}

              {connectionStatus === "QR_READY" && (
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 inline-block mx-auto max-w-sm">
                  <div className="bg-white p-4 rounded-xl shadow-inner mb-4 inline-block">
                    {/* SVG Simulated QR Code */}
                    <svg className="w-48 h-48 mx-auto" viewBox="0 0 100 100">
                      <rect width="100" height="100" fill="white" />
                      <path d="M10 10h30v30h-30z M15 15h20v20h-20z M20 20h10v10h-10z M60 10h30v30h-30z M65 15h20v20h-20z M70 20h10v10h-10z M10 60h30v30h-30z M15 65h20v20h-20z M20 70h10v10h-10z" fill="black" />
                      <path d="M45 10h10v10h-10z M45 30h10v20h-10z M10 45h20v10h-20z M60 45h30v10h-30z M45 70h20v20h-20z M70 60h20v10h-20z M80 80h10v10h-10z" fill="black" />
                    </svg>
                  </div>
                  <p className="text-xs text-slate-400 mb-4">
                    Open WhatsApp on your phone → Linked Devices → Link a Device, and point your camera at this QR code.
                  </p>
                  <button
                    onClick={handleSimulateScan}
                    disabled={loading}
                    className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center justify-center gap-2"
                  >
                    {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                    <span>Simulate Scan & Connect</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
