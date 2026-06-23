"use client";

import { useState, useEffect } from "react";
import { Headphones, Radio, Settings, Play, Pause, CheckCircle2, Sparkles } from "lucide-react";

import type { CallDisposition } from "@/features/workspace/data/crm-dialer-demo";
import { CALL_DISPOSITION_META } from "@/features/workspace/data/crm-dialer-demo";

import { DialerKpiStrip } from "@/features/workspace/components/crm/dialer/dialer-keypad";
import { dialer } from "@/features/workspace/components/crm/dialer/dialer-styles";
import { DialerActiveCallPanel } from "@/features/workspace/components/crm/dialer/dialer-active-call-panel";
import { DialerCallHistoryPanel } from "@/features/workspace/components/crm/dialer/dialer-call-history-panel";
import { DialerDispositionModal } from "@/features/workspace/components/crm/dialer/dialer-disposition-modal";
import { CrmPageHeader } from "@/features/workspace/components/crm/crm-workspace-header";
import { formatCallDuration } from "@/features/workspace/data/crm-dialer-demo";
import type { CallLogEntry } from "@/features/workspace/data/crm-dialer-demo";
import { useDialerSession } from "@/features/workspace/hooks/use-dialer-session";
import { useCurrentUser } from "@/hooks/use-current-user";
import { AdminModal } from "@/features/super-admin/components/admin-modal";
import { crm } from "@/features/workspace/components/crm/crm-styles";
import { workspaceStore } from "@/stores/workspace.store";
import { apiClient } from "@/lib/api/client";
import { cn } from "@/lib/utils/cn";

export function CrmDialerView() {
  const session = useDialerSession();
  const user = useCurrentUser();
  const { workspaceId, workspaceName } = workspaceStore();

  const isOwner = user?.profileRole === "owner";

  const [showConfigModal, setShowConfigModal] = useState(false);
  const [selectedHistoryEntry, setSelectedHistoryEntry] = useState<CallLogEntry | null>(null);
  const [companyLogo, setCompanyLogo] = useState<string | null>(null);

  // Load company logo image reactively when workspaceId resolves
  useEffect(() => {
    if (!workspaceId) return;
    async function loadCompanyLogo() {
      try {
        const { data } = await apiClient.get(`/company/${workspaceId}`);
        if (data.success && data.data) {
          setCompanyLogo(data.data.logo || null);
        }
      } catch (err) {
        console.error("Failed to load company logo in dialer view:", err);
      }
    }
    loadCompanyLogo();
  }, [workspaceId]);

  // Dialer configuration state (mock settings)
  const [config, setConfig] = useState({
    autoRecord: true,
    callerId: "+1 (415) 555-0100",
    powerDialDelay: 5,
    twilioSid: "",
    twilioToken: "••••••••••••••••••••••••••••••••",
    twilioNumber: "+1 (415) 555-0100",
  });
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Audio recording player simulation states
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);

  // Edit disposition state for history entry modal
  const [editingDisposition, setEditingDisposition] = useState<CallDisposition | null>(null);
  const [editingNotes, setEditingNotes] = useState("");
  const [dispositionSaved, setDispositionSaved] = useState(false);

  // Event handler for selecting/clearing call history entries
  const handleSelectHistoryEntry = (entry: CallLogEntry | null) => {
    setIsPlaying(false);
    setCurrentTime(0);
    setEditingDisposition(entry ? entry.disposition : null);
    setEditingNotes(entry?.notes ?? "");
    setDispositionSaved(false);
    setSelectedHistoryEntry(entry);
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && selectedHistoryEntry) {
      interval = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= selectedHistoryEntry.durationSec) {
            setIsPlaying(false);
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, selectedHistoryEntry]);

  const activeContact =
    session.activeTarget?.kind === "contact" ? session.activeTarget.contact : null;
  const manualPhone =
    session.activeTarget?.kind === "manual" ? session.activeTarget.phone : undefined;

  const displayName =
    activeContact?.name ?? (manualPhone ? "Manual dial" : session.dialedNumber || "Contact");
  const displayPhone = activeContact?.phone ?? manualPhone ?? session.dialedNumber;

  const inCall =
    session.phase === "dialing" ||
    session.phase === "ringing" ||
    session.phase === "connected";

  const connectRate =
    session.sessionStats.callsToday > 0
      ? Math.round((session.sessionStats.connected / session.sessionStats.callsToday) * 100)
      : 0;

  const getMockTranscript = (entry: CallLogEntry) => {
    if (
      entry.disposition !== "connected" &&
      entry.disposition !== "callback" &&
      entry.disposition !== "voicemail"
    ) {
      return null;
    }
    if (entry.disposition === "voicemail") {
      return [
        {
          time: "00:02",
          speaker: "Voicemail",
          text: `[Beep] "Hi, you have reached the voicemail of ${entry.contactName} at ${entry.company || "their office"}. Please leave a message after the tone."`,
        },
        {
          time: "00:10",
          speaker: "Executive (Voicemail Left)",
          text: `"Hi ${entry.contactName}, this is Lucky calling from Rivexa. I noticed your interest in our CRM Dialer capabilities and wanted to check if you have 10 minutes later this week. Please call me back at +1 (415) 555-0100. Thanks!"`,
        },
      ];
    }
    if (entry.contactName === "Priya Nair") {
      return [
        { time: "00:01", speaker: "Priya Nair", text: "Hello, Priya here. Who's calling?" },
        {
          time: "00:04",
          speaker: "Executive",
          text: "Hi Priya, this is Lucky from Rivexa. I saw you signed up for our sales workspace trial yesterday.",
        },
        {
          time: "00:09",
          speaker: "Priya Nair",
          text: "Ah yes, Lucky! I was actually just reviewing the CRM dialer with my team. It looks very clean.",
        },
        {
          time: "00:15",
          speaker: "Executive",
          text: "Glad to hear that. What specific requirements are you hoping to solve for your outbound campaigns?",
        },
        {
          time: "00:21",
          speaker: "Priya Nair",
          text: "Well, we have around 25 sales reps, and we need a dialer that directly syncs with lead logs and supports custom recording. Do you offer bulk seat discounts for enterprise?",
        },
        {
          time: "00:30",
          speaker: "Executive",
          text: "Absolutely, we do. We have custom packaging for teams over 20 seats that includes auto-dispositions and dedicated Twilio sub-accounts.",
        },
        {
          time: "00:38",
          speaker: "Priya Nair",
          text: "That sounds perfect. Can you email me a detailed proposal with the pricing breakdown?",
        },
        {
          time: "00:43",
          speaker: "Executive",
          text: "I'll draft it up and send it over right away to your email. I'll also add a note to follow up.",
        },
        { time: "00:49", speaker: "Priya Nair", text: "Great, thanks Lucky. Talk soon." },
        { time: "00:52", speaker: "Executive", text: "Thanks, Priya. Have a great day!" },
      ];
    }
    if (entry.contactName === "Carlos Mendez") {
      return [
        { time: "00:01", speaker: "Carlos Mendez", text: "Hello, this is Carlos." },
        {
          time: "00:03",
          speaker: "Executive",
          text: "Hi Carlos, Lucky here from Rivexa flow. Is now a good time to connect regarding your team setup?",
        },
        {
          time: "00:07",
          speaker: "Carlos Mendez",
          text: "Hey Lucky. Actually, I'm heading into a board meeting right now. Can we schedule a callback?",
        },
        {
          time: "00:12",
          speaker: "Executive",
          text: "Of course! How does Thursday at 2 PM CST sound for you?",
        },
        {
          time: "00:17",
          speaker: "Carlos Mendez",
          text: "Thursday at 2 PM works perfectly. I will make a note.",
        },
        {
          time: "00:21",
          speaker: "Executive",
          text: "Perfect, I've logged the callback in our CRM. Talk to you on Thursday!",
        },
        { time: "00:26", speaker: "Carlos Mendez", text: "Thank you, Lucky. Bye." },
      ];
    }
    return [
      { time: "00:01", speaker: entry.contactName, text: "Hello?" },
      {
        time: "00:04",
        speaker: "Executive",
        text: `Hi ${entry.contactName}, this is the team at Rivexa. Hope you are having a productive day.`,
      },
      {
        time: "00:10",
        speaker: entry.contactName,
        text: "Hi! Yes, I was actually looking at your product walkthrough. It looks very interesting.",
      },
      {
        time: "00:16",
        speaker: "Executive",
        text: "Awesome! I'd love to walk you through a brief 5-minute demo of the workspace modules if you have a moment.",
      },
      {
        time: "00:22",
        speaker: entry.contactName,
        text: "Sure, let's do it. I'm especially interested in how permissions and general settings work.",
      },
      {
        time: "00:28",
        speaker: "Executive",
        text: "Perfect. I have saved our call status and synced it to your lead timeline. Let's look at the dashboard.",
      },
    ];
  };

  return (
    <div className="pb-8">
      <CrmPageHeader
        eyebrow="Outbound · CRM"
        title="Dialer"
        actions={
          <div className="flex flex-wrap items-center gap-2">
            {isOwner && (
              <button
                type="button"
                onClick={() => setShowConfigModal(true)}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200/80 bg-white hover:bg-slate-50 px-3 py-2 text-xs font-semibold text-[#191970] shadow-sm transition-all duration-200 dark:border-slate-700 dark:bg-slate-900 dark:text-indigo-300"
              >
                <Settings className="h-3.5 w-3.5" />
                Configuration
              </button>
            )}
            <span
              className={cn(
                "inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold shadow-sm",
                inCall
                  ? "border-emerald-200/80 bg-emerald-50 text-emerald-800 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-200"
                  : "border-slate-200/80 bg-white text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300",
              )}
            >
              <span
                className={cn(
                  "h-2 w-2 rounded-full",
                  inCall ? "animate-pulse bg-emerald-500" : "bg-emerald-500",
                )}
              />
              {inCall ? "Session live" : "VoIP ready"}
            </span>
            <span className="inline-flex items-center gap-2 rounded-xl border border-slate-200/80 bg-white px-3 py-2 text-xs shadow-sm dark:border-slate-700 dark:bg-slate-900">
              <Headphones className="h-3.5 w-3.5 text-[#191970]" />
              <span className="font-medium text-slate-600 dark:text-slate-300">Demo mode</span>
            </span>
          </div>
        }
      />

      <DialerKpiStrip
        items={[
          {
            label: "Calls today",
            value: session.sessionStats.callsToday,
            accent: "#191970",
          },
          {
            label: "Connected",
            value: session.sessionStats.connected,
            accent: "#10b981",
          },
          {
            label: "Connect rate",
            value: `${connectRate}%`,
            accent: "#6366f1",
          },
          {
            label: "Talk time",
            value: formatCallDuration(session.sessionStats.talkTimeSec),
            accent: "#0ea5e9",
          },
        ]}
      />

      <div
        className={cn(
          dialer.workspace,
          "mt-4 grid min-h-[680px] overflow-hidden lg:grid-cols-[minmax(0,1fr)_300px]",
        )}
      >
        <main className="border-b border-slate-100 lg:border-b-0 lg:border-r dark:border-slate-800">
          <DialerActiveCallPanel
            phase={session.phase}
            contact={activeContact}
            manualPhone={manualPhone}
            dialedNumber={session.dialedNumber}
            callDurationSec={session.callDurationSec}
            muted={session.muted}
            onHold={session.onHold}
            showKeypad={session.showInCallKeypad}
            callNotes={session.callNotes}
            onCallNotesChange={session.setCallNotes}
            onDigit={session.appendDigit}
            onBackspace={session.backspace}
            onChange={session.setDialedNumber}
            onToggleMute={session.toggleMute}
            onToggleHold={session.toggleHold}
            onToggleKeypad={() => session.setShowInCallKeypad(!session.showInCallKeypad)}
            onCallManual={session.callManual}
            onCancel={session.cancelCall}
            onEndCall={session.endCall}
            companyLogo={companyLogo}
            companyName={workspaceName}
          />
        </main>

        <aside>
          <DialerCallHistoryPanel
            entries={session.callLog}
            onEntryClick={(entry) => handleSelectHistoryEntry(entry)}
          />
        </aside>
      </div>

      <p className="mt-3 flex items-center gap-2 text-xs text-slate-500">
        <Radio className="h-3.5 w-3.5 text-[#191970]" />
        Power dial auto-advances after each disposition. Connect Twilio in CRM Settings for live calling.
      </p>

      <DialerDispositionModal
        key={`${displayPhone}-${session.pendingDisposition}`}
        open={session.pendingDisposition}
        contactName={displayName}
        phone={displayPhone}
        initialNotes={session.callNotes}
        onClose={() => session.submitDisposition("no_answer")}
        onSubmit={(disposition, notes) => session.submitDisposition(disposition, notes)}
        onSaveOnly={(disposition, notes) => session.saveDisposition(disposition, notes)}
      />

      {/* Configuration Modal */}
      {showConfigModal && (
        <AdminModal
          open={showConfigModal}
          title="Dialer Configuration"
          description="Adjust call gateway and campaign logic. These settings apply organization-wide."
          onClose={() => setShowConfigModal(false)}
        >
          <div className="space-y-4">
            {saveSuccess && (
              <div className="flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs font-semibold text-emerald-800 dark:bg-emerald-950/30 dark:border-emerald-900/40 dark:text-emerald-300 animate-pulse">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                Settings updated successfully!
              </div>
            )}

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Outbound Caller ID
              </label>
              <select
                value={config.callerId}
                onChange={(e) => setConfig({ ...config, callerId: e.target.value })}
                className={cn(crm.select, "w-full h-9 px-3 rounded-xl")}
              >
                <option value="+1 (415) 555-0100">+1 (415) 555-0100 (HQ Office)</option>
                <option value="+91 22 5555 0199">+91 22 5555 0199 (Mumbai Branch)</option>
                <option value="+44 20 7946 0822">+44 20 7946 0822 (London Branch)</option>
              </select>
              <p className="mt-1 text-[11px] text-slate-400 leading-normal">
                This number is displayed to contacts when initiating outbound dialer sessions.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Auto-Dial Transition Cooldown
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="2"
                  max="15"
                  value={config.powerDialDelay}
                  onChange={(e) => setConfig({ ...config, powerDialDelay: parseInt(e.target.value) })}
                  className="flex-1 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer dark:bg-slate-700 accent-[#191970]"
                />
                <span className="text-xs font-mono font-bold text-slate-700 bg-slate-100 rounded-md px-2 py-1 dark:text-slate-300 dark:bg-slate-800">
                  {config.powerDialDelay}s
                </span>
              </div>
              <p className="mt-1 text-[11px] text-slate-400 leading-normal">
                Number of seconds before the power dialer initiates the next call after disposition submission.
              </p>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
              <div>
                <p className="text-xs font-bold text-slate-700 dark:text-slate-200">Auto-Record Call Sessions</p>
                <p className="text-[11px] text-slate-400">Record and transcribe call audio automatically.</p>
              </div>
              <button
                type="button"
                onClick={() => setConfig({ ...config, autoRecord: !config.autoRecord })}
                className={cn(
                  "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
                  config.autoRecord ? "bg-[#191970] dark:bg-indigo-600" : "bg-slate-200 dark:bg-slate-700",
                )}
              >
                <span
                  className={cn(
                    "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                    config.autoRecord ? "translate-x-5" : "translate-x-0",
                  )}
                />
              </button>
            </div>

            <div className="border-t border-slate-100 pt-4 dark:border-slate-800">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                Twilio VoIP Credentials
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 mb-1">
                    Account SID
                  </label>
                  <input
                    type="text"
                    value={config.twilioSid}
                    onChange={(e) => setConfig({ ...config, twilioSid: e.target.value })}
                    className={cn(crm.input, "w-full font-mono text-xs")}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 mb-1">
                    Auth Token
                  </label>
                  <input
                    type="password"
                    value={config.twilioToken}
                    onChange={(e) => setConfig({ ...config, twilioToken: e.target.value })}
                    className={cn(crm.input, "w-full font-mono text-xs")}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <button
                type="button"
                onClick={() => setShowConfigModal(false)}
                className={crm.btnSecondary}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setSaveSuccess(true);
                  setTimeout(() => {
                    setSaveSuccess(false);
                    setShowConfigModal(false);
                  }, 1200);
                }}
                className={crm.btnPrimary}
              >
                Save Settings
              </button>
            </div>
          </div>
        </AdminModal>
      )}

      {/* Activity History Detail Modal */}
      {selectedHistoryEntry && (
        <AdminModal
          open={!!selectedHistoryEntry}
          title="Call Log Entry Details"
          description="Detailed call breakdown including duration, disposition, recording, and transcript."
          onClose={() => handleSelectHistoryEntry(null)}
        >
          <div className="space-y-4">
            <div className="flex items-center gap-4 rounded-xl border border-slate-100 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-900/50">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#191970]/10 text-xl font-bold text-[#191970] dark:bg-indigo-900/30 dark:text-indigo-300">
                {selectedHistoryEntry.contactName.charAt(0)}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-base font-bold text-slate-900 dark:text-white truncate">
                  {selectedHistoryEntry.contactName}
                </h3>
                <p className="text-xs text-slate-500 truncate">{selectedHistoryEntry.company}</p>
                <p className="mt-1 text-xs font-mono text-slate-400">{selectedHistoryEntry.phone}</p>
              </div>
              <span
                className={cn(
                  "rounded-xl px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider shadow-sm ring-1 ring-inset",
                  selectedHistoryEntry.disposition === "connected"
                    ? "bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-950/20 dark:text-emerald-300"
                    : selectedHistoryEntry.disposition === "voicemail" ||
                        selectedHistoryEntry.disposition === "callback"
                      ? "bg-blue-50 text-blue-700 ring-blue-600/20 dark:bg-blue-950/20 dark:text-blue-300"
                      : selectedHistoryEntry.disposition === "busy"
                        ? "bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-950/20 dark:text-amber-300"
                        : "bg-rose-50 text-rose-700 ring-rose-600/20 dark:bg-rose-950/20 dark:text-rose-300",
                )}
              >
                {selectedHistoryEntry.disposition.replace("_", " ")}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3 rounded-xl border border-slate-100 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div>
                <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Direction</p>
                <p className="mt-0.5 text-xs font-semibold capitalize text-slate-700 dark:text-slate-200">
                  {selectedHistoryEntry.direction}
                </p>
              </div>
              <div>
                <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Time</p>
                <p className="mt-0.5 text-xs font-semibold text-slate-700 dark:text-slate-200">
                  {selectedHistoryEntry.startedAt}
                </p>
              </div>
              <div>
                <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Duration</p>
                <p className="mt-0.5 text-xs font-mono font-semibold text-slate-700 dark:text-slate-200">
                  {formatCallDuration(selectedHistoryEntry.durationSec)}
                </p>
              </div>
            </div>

            {selectedHistoryEntry.durationSec > 0 && (
              <div className="rounded-xl border border-[#191970]/10 bg-[#191970]/[0.02] p-4 dark:border-slate-800">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-bold uppercase tracking-wider text-[#191970] dark:text-indigo-300 flex items-center gap-1.5">
                    <Headphones className="h-3.5 w-3.5" />
                    Call Recording
                  </p>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {formatCallDuration(currentTime)} / {formatCallDuration(selectedHistoryEntry.durationSec)}
                  </span>
                </div>

                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#191970] hover:bg-[#12124a] text-white shadow-md transition-all hover:scale-105 active:scale-95 dark:bg-indigo-600 dark:hover:bg-indigo-700"
                  >
                    {isPlaying ? (
                      <Pause className="h-4.5 w-4.5" />
                    ) : (
                      <Play className="h-4.5 w-4.5 fill-current ml-0.5" />
                    )}
                  </button>

                  <div className="flex-1 flex items-end gap-[3px] h-8 pt-1">
                    {Array.from({ length: 32 }).map((_, i) => {
                      const played = (i / 32) * selectedHistoryEntry.durationSec < currentTime;
                      const randomHeight = Math.sin((i / 32) * Math.PI * 4) * 8 + 14 + (i % 3 ? 4 : 0);
                      return (
                        <span
                          key={i}
                          style={{ height: `${randomHeight}px` }}
                          className={cn(
                            "flex-1 rounded-full transition-colors duration-300",
                            played ? "bg-[#191970] dark:bg-indigo-500" : "bg-slate-200 dark:bg-slate-700",
                          )}
                        />
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {selectedHistoryEntry.notes && (
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Call Notes</h4>
                <p className="rounded-xl border border-slate-100 bg-slate-50/50 p-3.5 text-xs leading-relaxed text-slate-700 dark:border-slate-800 dark:bg-slate-900/35 dark:text-slate-300">
                  {selectedHistoryEntry.notes}
                </p>
              </div>
            )}

            {getMockTranscript(selectedHistoryEntry) && (
              <div className="border-t border-slate-100 pt-4 dark:border-slate-800">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-[#191970] dark:text-indigo-400 animate-pulse" />
                  AI Transcript Analysis
                </h4>
                <div className="max-h-[220px] overflow-y-auto rounded-xl border border-slate-100 bg-slate-50/30 p-3 space-y-3 dark:border-slate-800 dark:bg-slate-950/20">
                  {getMockTranscript(selectedHistoryEntry)?.map((t, idx) => (
                    <div key={idx} className="text-xs">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span
                          className={cn(
                            "font-bold",
                            t.speaker === "Executive" || t.speaker.startsWith("Executive")
                              ? "text-[#191970] dark:text-indigo-400"
                              : "text-slate-700 dark:text-slate-300",
                          )}
                        >
                          {t.speaker}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">{t.time}</span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-400 leading-relaxed pl-2 border-l-2 border-slate-200 dark:border-slate-800">
                        {t.text}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Change Outcome Section */}
            <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-4 dark:border-slate-800 dark:bg-slate-950/30">
              <p className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">
                Change outcome
              </p>
              {dispositionSaved && (
                <div className="mb-3 flex items-center gap-2 rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-2 text-xs font-semibold text-emerald-800 dark:bg-emerald-950/30 dark:border-emerald-900/40 dark:text-emerald-300">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                  Outcome updated successfully
                </div>
              )}
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {(Object.keys(CALL_DISPOSITION_META) as CallDisposition[]).map((d) => {
                  const meta = CALL_DISPOSITION_META[d];
                  const isSelected = editingDisposition === d;
                  const toneClass: Record<string, string> = {
                    emerald: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-950/20 dark:text-emerald-300",
                    blue: "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900/40 dark:bg-blue-950/20 dark:text-blue-300",
                    amber: "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/40 dark:bg-amber-950/20 dark:text-amber-300",
                    slate: "border-slate-200 bg-white text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300",
                    rose: "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/20 dark:text-rose-300",
                  };
                  return (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setEditingDisposition(d)}
                      className={cn(
                        "relative rounded-xl border px-3 py-2.5 text-left text-xs font-semibold transition-all duration-150 hover:scale-[1.02]",
                        isSelected
                          ? "border-[#191970] bg-[#191970]/5 text-[#191970] ring-2 ring-[#191970]/20 dark:bg-indigo-950/20 dark:text-indigo-300"
                          : toneClass[meta.tone],
                      )}
                    >
                      {isSelected && (
                        <CheckCircle2 className="absolute right-2 top-2 h-3.5 w-3.5 text-[#191970] dark:text-indigo-400" />
                      )}
                      {meta.label}
                    </button>
                  );
                })}
              </div>
              <div className="mt-3">
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Notes (optional)
                </label>
                <textarea
                  value={editingNotes}
                  onChange={(e) => setEditingNotes(e.target.value)}
                  rows={2}
                  placeholder="Add or update notes for this call…"
                  className={cn(crm.input, "h-auto min-h-[60px] w-full resize-y py-2 text-xs")}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => handleSelectHistoryEntry(null)}
                className={crm.btnSecondary}
              >
                Close
              </button>
              <button
                type="button"
                disabled={!editingDisposition}
                onClick={() => {
                  if (editingDisposition && selectedHistoryEntry) {
                    session.updateLogDisposition(
                      selectedHistoryEntry.id,
                      editingDisposition,
                      editingNotes.trim() || undefined,
                    );
                    setDispositionSaved(true);
                    // Sync the live selectedHistoryEntry with updated disposition to refresh badge
                    setSelectedHistoryEntry((prev) =>
                      prev ? { ...prev, disposition: editingDisposition, notes: editingNotes.trim() || prev.notes } : prev,
                    );
                  }
                }}
                className={cn(crm.btnPrimary, "min-w-[130px]")}
              >
                Save outcome
              </button>
            </div>
          </div>
        </AdminModal>
      )}
    </div>
  );
}
