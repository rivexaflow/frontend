"use client";

import type { ElementType } from "react";
import {
  Building2,
  Calendar,
  Grid3X3,
  Mail,
  Mic,
  MicOff,
  Pause,
  Phone,
  PhoneCall,
  PhoneOff,
  Play,
  Sparkles,
  Voicemail,
} from "lucide-react";

import {
  DialerKeypad,
  DialerStatusPill,
  DialerWaveform,
} from "@/features/workspace/components/crm/dialer/dialer-keypad";
import { CALL_SCRIPT_SNIPPETS, dialer } from "@/features/workspace/components/crm/dialer/dialer-styles";
import { CrmRecordAvatar, CrmSourceTag } from "@/features/workspace/components/crm/crm-ui-primitives";
import { crm } from "@/features/workspace/components/crm/crm-styles";
import { formatCallDuration } from "@/features/workspace/data/crm-dialer-demo";
import type { DialerContact } from "@/features/workspace/data/crm-dialer-demo";
import type { CallPhase } from "@/features/workspace/hooks/use-dialer-session";
import { cn } from "@/lib/utils/cn";

type Props = {
  phase: CallPhase;
  contact?: DialerContact | null;
  nextContact?: DialerContact | null;
  manualPhone?: string;
  dialedNumber: string;
  callDurationSec: number;
  muted: boolean;
  onHold: boolean;
  showKeypad: boolean;
  callNotes: string;
  onCallNotesChange: (value: string) => void;
  onDigit: (digit: string) => void;
  onBackspace: () => void;
  onToggleMute: () => void;
  onToggleHold: () => void;
  onToggleKeypad: () => void;
  onCallManual: () => void;
  onCallContact?: (contact: DialerContact) => void;
  onCancel: () => void;
  onEndCall: () => void;
};

function phaseMeta(phase: CallPhase): { label: string; tone: "neutral" | "live" | "success" | "warning" } {
  switch (phase) {
    case "dialing":
      return { label: "Dialing", tone: "warning" };
    case "ringing":
      return { label: "Ringing", tone: "live" };
    case "connected":
      return { label: "Live call", tone: "success" };
    case "ended":
      return { label: "Call ended", tone: "neutral" };
    default:
      return { label: "Ready", tone: "neutral" };
  }
}

export function DialerActiveCallPanel({
  phase,
  contact,
  nextContact,
  manualPhone,
  dialedNumber,
  callDurationSec,
  muted,
  onHold,
  showKeypad,
  callNotes,
  onCallNotesChange,
  onDigit,
  onBackspace,
  onToggleMute,
  onToggleHold,
  onToggleKeypad,
  onCallManual,
  onCallContact,
  onCancel,
  onEndCall,
}: Props) {
  const displayPhone = contact?.phone ?? manualPhone ?? dialedNumber;
  const displayName =
    contact?.name ?? (manualPhone ? "Manual dial" : dialedNumber ? "New number" : "Outbound dialer");
  const inProgress = phase === "dialing" || phase === "ringing" || phase === "connected";
  const canManualCall = phase === "idle" && dialedNumber.replace(/\D/g, "").length >= 8;
  const status = phaseMeta(phase);

  const appendSnippet = (snippet: string) => {
    const next = callNotes ? `${callNotes}\n• ${snippet}` : `• ${snippet}`;
    onCallNotesChange(next);
  };

  return (
    <div className="flex h-full min-h-[640px] flex-col">
      {/* Phone stage — dark softphone header */}
      <div className={cn(dialer.phoneStage, "relative shrink-0 px-6 pb-6 pt-8")}>
        <div className={dialer.phoneStageGlow} />

        <div className="relative flex flex-col items-center text-center">
          <DialerStatusPill label={status.label} tone={inProgress ? status.tone : "neutral"} />

          {phase === "connected" ? (
            <>
              <div className="relative mt-5">
                <span className="absolute -inset-2 animate-ping rounded-full bg-emerald-400/20" />
                <CrmRecordAvatar name={displayName} size="md" />
              </div>
              <p className="mt-4 text-xl font-semibold text-white">{displayName}</p>
              <p className="mt-1 font-mono text-sm text-white/60">{displayPhone}</p>
              <p className="mt-4 font-mono text-4xl font-bold tabular-nums tracking-tight text-white">
                {formatCallDuration(callDurationSec)}
              </p>
              <div className="mt-3">
                <DialerWaveform active />
              </div>
              {onHold ? (
                <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-amber-200/90">On hold</p>
              ) : null}
              {muted ? (
                <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-white/50">Muted</p>
              ) : null}
            </>
          ) : inProgress ? (
            <>
              <div className="relative mt-6 flex h-20 w-20 items-center justify-center">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white/10" />
                <span className="relative flex h-16 w-16 items-center justify-center rounded-full bg-white/15 ring-1 ring-white/20 backdrop-blur">
                  <PhoneCall className="h-7 w-7 text-white" />
                </span>
              </div>
              <p className="mt-5 text-xl font-semibold text-white">{displayName}</p>
              <p className="mt-1 font-mono text-sm text-white/60">{displayPhone}</p>
              {contact ? (
                <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
                  <span className="rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-semibold text-white/80">
                    {contact.company}
                  </span>
                  <CrmSourceTag label={contact.source} />
                </div>
              ) : null}
            </>
          ) : (
            <>
              <div className="mt-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/15 backdrop-blur">
                <Phone className="h-6 w-6 text-white/90" />
              </div>
              <p className="mt-4 text-lg font-semibold text-white">Click-to-call workspace</p>
              <p className="mt-1 max-w-xs text-sm text-white/55">
                Dial manually or pick a lead from the queue — stay in context without switching tabs.
              </p>
            </>
          )}
        </div>
      </div>

      {/* Body */}
      {phase === "idle" ? (
        <div className="flex flex-1 flex-col bg-gradient-to-b from-slate-50/80 to-white dark:from-slate-950/40 dark:to-slate-900 lg:flex-row">
          <div className="flex flex-1 flex-col items-center justify-center border-b border-slate-100 px-6 py-8 dark:border-slate-800 lg:border-b-0 lg:border-r">
            <DialerKeypad
              value={dialedNumber}
              onDigit={onDigit}
              onBackspace={onBackspace}
              variant="light"
            />
            <div className="mt-6 flex items-center gap-4">
              <button
                type="button"
                disabled={!canManualCall}
                onClick={onCallManual}
                className={dialer.callFab}
                aria-label="Place call"
              >
                <Phone className="h-6 w-6" />
              </button>
            </div>
            <p className="mt-4 text-center text-xs text-slate-500">
              {canManualCall ? "Tap to call entered number" : "Enter at least 8 digits to dial"}
            </p>
          </div>

          <div className="w-full shrink-0 space-y-4 px-5 py-6 lg:w-[280px]">
            <div>
              <p className={crm.sectionLabel}>Next in queue</p>
              {nextContact ? (
                <div className="mt-2 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                  <div className="flex items-center gap-3">
                    <CrmRecordAvatar name={nextContact.name} size="sm" />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                        {nextContact.name}
                      </p>
                      <p className="truncate text-xs text-slate-500">{nextContact.company}</p>
                    </div>
                  </div>
                  <p className="mt-3 font-mono text-xs text-slate-500">{nextContact.phone}</p>
                  <button
                    type="button"
                    onClick={() => onCallContact?.(nextContact)}
                    className={cn(crm.btnPrimarySm, "mt-3 w-full")}
                  >
                    <Phone className="h-3.5 w-3.5" />
                    Call next lead
                  </button>
                </div>
              ) : (
                <p className="mt-2 rounded-xl border border-dashed border-slate-200 px-3 py-6 text-center text-xs text-slate-500 dark:border-slate-700">
                  Queue complete — add leads or import to keep dialing.
                </p>
              )}
            </div>

            <div>
              <p className={crm.sectionLabel}>Quick scripts</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {CALL_SCRIPT_SNIPPETS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => appendSnippet(s)}
                    className="rounded-lg border border-slate-200/80 bg-white px-2.5 py-1.5 text-[11px] font-medium text-slate-600 transition hover:border-[#191970]/30 hover:text-[#191970] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-[#191970]/10 bg-[#191970]/[0.04] px-3 py-3">
              <p className="flex items-center gap-1.5 text-[11px] font-semibold text-[#191970]">
                <Sparkles className="h-3.5 w-3.5" />
                AI assist
              </p>
              <p className="mt-1 text-[11px] leading-relaxed text-slate-600 dark:text-slate-400">
                Live transcription and talk-track suggestions appear here once VoIP is connected.
              </p>
            </div>
          </div>
        </div>
      ) : null}

      {(phase === "dialing" || phase === "ringing") && contact ? (
        <div className="flex-1 space-y-4 bg-white px-5 py-5 dark:bg-slate-900">
          <ProspectCard contact={contact} />
          <button type="button" onClick={onCancel} className={cn(crm.btnSecondary, "w-full")}>
            <PhoneOff className="h-4 w-4" />
            Cancel call
          </button>
        </div>
      ) : null}

      {phase === "connected" ? (
        <div className="flex flex-1 flex-col gap-4 overflow-y-auto bg-white px-5 py-5 dark:bg-slate-900">
          {contact ? <ProspectCard contact={contact} compact /> : null}

          <div>
            <div className="mb-2 flex items-center justify-between">
              <label htmlFor="call-notes" className={crm.sectionLabel}>
                Live notes
              </label>
              <button
                type="button"
                className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#191970] hover:underline"
              >
                <Voicemail className="h-3 w-3" />
                Drop voicemail
              </button>
            </div>
            <textarea
              id="call-notes"
              value={callNotes}
              onChange={(e) => onCallNotesChange(e.target.value)}
              rows={4}
              placeholder="Objections, next steps, budget signals — synced to lead timeline on save."
              className={cn(crm.input, "h-auto min-h-[100px] w-full resize-y py-2.5")}
            />
            <div className="mt-2 flex flex-wrap gap-1.5">
              {CALL_SCRIPT_SNIPPETS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => appendSnippet(s)}
                  className="rounded-md bg-slate-100 px-2 py-1 text-[10px] font-medium text-slate-600 hover:bg-[#191970]/10 hover:text-[#191970] dark:bg-slate-800 dark:text-slate-400"
                >
                  + {s}
                </button>
              ))}
            </div>
          </div>

          {showKeypad ? (
            <DialerKeypad compact value="" onDigit={onDigit} onBackspace={onBackspace} disabled={onHold} />
          ) : null}
        </div>
      ) : null}

      {inProgress ? (
        <div className={dialer.controlDock}>
          <div className="mx-auto flex max-w-lg items-center justify-center gap-3">
            {phase === "connected" ? (
              <>
                <DialerControlButton
                  label={muted ? "Unmute" : "Mute"}
                  active={muted}
                  onClick={onToggleMute}
                  icon={muted ? MicOff : Mic}
                />
                <DialerControlButton
                  label={onHold ? "Resume" : "Hold"}
                  active={onHold}
                  onClick={onToggleHold}
                  icon={onHold ? Play : Pause}
                />
                <DialerControlButton
                  label="Keypad"
                  active={showKeypad}
                  onClick={onToggleKeypad}
                  icon={Grid3X3}
                />
                <button type="button" onClick={onEndCall} className={dialer.endCall} aria-label="End call">
                  <PhoneOff className="h-6 w-6" />
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={onCancel}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
              >
                <PhoneOff className="h-4 w-4" />
                Cancel call
              </button>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function ProspectCard({ contact, compact }: { contact: DialerContact; compact?: boolean }) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-slate-200/80 bg-gradient-to-br from-slate-50/80 to-white dark:border-slate-800 dark:from-slate-950/40 dark:to-slate-900",
        compact ? "p-3" : "p-4",
      )}
    >
      <div className="flex items-start gap-3">
        <CrmRecordAvatar name={contact.name} />
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-slate-900 dark:text-white">{contact.name}</p>
          <p className="text-xs text-slate-500">{contact.title}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <CrmSourceTag label={contact.source} />
            <span className="rounded-md bg-[#191970]/10 px-2 py-0.5 text-[10px] font-bold text-[#191970]">
              {contact.scoreBand}
            </span>
          </div>
        </div>
      </div>
      {!compact ? (
        <dl className="mt-4 grid gap-2.5 text-sm sm:grid-cols-2">
          <InfoRow icon={Building2} label={contact.company} />
          <InfoRow icon={Mail} label={contact.email} />
          <InfoRow icon={Phone} label={contact.phone} mono />
          <InfoRow icon={Calendar} label={contact.leadRef} mono />
        </dl>
      ) : (
        <dl className="mt-3 grid gap-2 text-xs sm:grid-cols-2">
          <InfoRow icon={Building2} label={contact.company} small />
          <InfoRow icon={Mail} label={contact.email} small />
        </dl>
      )}
    </div>
  );
}

function InfoRow({
  icon: Icon,
  label,
  mono,
  small,
}: {
  icon: ElementType;
  label: string;
  mono?: boolean;
  small?: boolean;
}) {
  return (
    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
      <Icon className="h-3.5 w-3.5 shrink-0 text-slate-400" />
      <span className={cn("truncate", mono && "font-mono", small ? "text-xs" : "text-sm")}>{label}</span>
    </div>
  );
}

function DialerControlButton({
  label,
  active,
  onClick,
  icon: Icon,
}: {
  label: string;
  active?: boolean;
  onClick: () => void;
  icon: ElementType;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex h-[72px] w-[72px] flex-col items-center justify-center gap-1.5 rounded-2xl border text-[10px] font-bold uppercase tracking-wide transition",
        active
          ? "border-[#191970]/30 bg-[#191970]/10 text-[#191970] shadow-sm"
          : "border-slate-200/80 bg-white text-slate-600 shadow-sm hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300",
      )}
    >
      <Icon className="h-5 w-5" />
      {label}
    </button>
  );
}
