"use client";

import { useMemo, useState } from "react";
import { Headphones, Radio } from "lucide-react";

import { DialerKpiStrip } from "@/features/workspace/components/crm/dialer/dialer-keypad";
import { dialer } from "@/features/workspace/components/crm/dialer/dialer-styles";
import { DialerActiveCallPanel } from "@/features/workspace/components/crm/dialer/dialer-active-call-panel";
import { DialerCallHistoryPanel } from "@/features/workspace/components/crm/dialer/dialer-call-history-panel";
import { DialerDispositionModal } from "@/features/workspace/components/crm/dialer/dialer-disposition-modal";
import { DialerQueuePanel } from "@/features/workspace/components/crm/dialer/dialer-queue-panel";
import { CrmPageHeader } from "@/features/workspace/components/crm/crm-workspace-header";
import { formatCallDuration } from "@/features/workspace/data/crm-dialer-demo";
import { useDialerSession } from "@/features/workspace/hooks/use-dialer-session";
import { cn } from "@/lib/utils/cn";

export function CrmDialerView() {
  const session = useDialerSession();
  const [queueSearch, setQueueSearch] = useState("");

  const activeContact =
    session.activeTarget?.kind === "contact" ? session.activeTarget.contact : null;
  const activeContactId = activeContact?.id;
  const manualPhone =
    session.activeTarget?.kind === "manual" ? session.activeTarget.phone : undefined;

  const nextContact = useMemo(
    () => session.queue.find((c) => c.queueStatus === "pending") ?? null,
    [session.queue],
  );

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

  return (
    <div className="pb-8">
      <CrmPageHeader
        eyebrow="Outbound · CRM"
        title="Dialer"
        description="Power dial through your lead queue, capture dispositions, and log every conversation — without leaving the CRM."
        actions={
          <div className="flex flex-wrap items-center gap-2">
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
          "mt-4 grid min-h-[680px] overflow-hidden lg:grid-cols-[320px_minmax(0,1fr)_300px]",
        )}
      >
        <aside className="border-b border-slate-100 lg:border-b-0 lg:border-r dark:border-slate-800">
          <DialerQueuePanel
            queue={session.queue}
            activeContactId={activeContactId}
            powerDial={session.powerDial}
            onPowerDialChange={session.setPowerDial}
            onCall={session.callContact}
            onSkip={session.skipQueueItem}
            onStartSession={session.startNextInQueue}
            search={queueSearch}
            onSearchChange={setQueueSearch}
            disabled={inCall}
          />
        </aside>

        <main className="border-b border-slate-100 lg:border-b-0 lg:border-r dark:border-slate-800">
          <DialerActiveCallPanel
            phase={session.phase}
            contact={activeContact}
            nextContact={nextContact}
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
            onToggleMute={session.toggleMute}
            onToggleHold={session.toggleHold}
            onToggleKeypad={() => session.setShowInCallKeypad(!session.showInCallKeypad)}
            onCallManual={session.callManual}
            onCallContact={session.callContact}
            onCancel={session.cancelCall}
            onEndCall={session.endCall}
          />
        </main>

        <aside>
          <DialerCallHistoryPanel entries={session.callLog} />
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
      />
    </div>
  );
}
