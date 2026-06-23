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
  onChange?: (value: string) => void;
  onToggleMute: () => void;
  onToggleHold: () => void;
  onToggleKeypad: () => void;
  onCallManual: () => void;
  onCancel: () => void;
  onEndCall: () => void;
  companyLogo?: string | null;
  companyName?: string | null;
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
  onChange,
  onToggleMute,
  onToggleHold,
  onToggleKeypad,
  onCallManual,
  onCancel,
  onEndCall,
  companyLogo,
  companyName,
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
                <span className="absolute -inset-3 animate-ping rounded-full bg-emerald-400/20" style={{ animationDuration: "3s" }} />
                <span className="absolute -inset-1.5 animate-pulse rounded-full bg-emerald-500/25" style={{ animationDuration: "1.5s" }} />
                <div className="relative border-2 border-emerald-400 rounded-full p-0.5 shadow-xl shadow-black/25">
                  <CrmRecordAvatar name={displayName} size="md" />
                </div>
              </div>
              <p className="mt-4 text-xl font-bold tracking-tight text-white">{displayName}</p>
              <p className="mt-1 font-mono text-sm text-white/60">{displayPhone}</p>
              <p className="mt-4 font-mono text-4xl font-extrabold tabular-nums tracking-tight text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.2)]">
                {formatCallDuration(callDurationSec)}
              </p>
              <div className="mt-4">
                <DialerWaveform active />
              </div>
              {onHold ? (
                <p className="mt-2.5 text-xs font-bold uppercase tracking-wider text-amber-300 drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]">On hold</p>
              ) : null}
              {muted ? (
                <p className="mt-1 text-xs font-bold uppercase tracking-wider text-white/50">Muted</p>
              ) : null}
            </>
          ) : inProgress ? (
            <>
              <div className="relative mt-6 flex h-20 w-20 items-center justify-center">
                <span className="absolute inset-0 animate-ping rounded-full bg-white/5" style={{ animationDuration: "2.5s" }} />
                <span className="absolute -inset-2.5 animate-pulse rounded-full bg-white/10" style={{ animationDuration: "1.5s" }} />
                <span className="relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-tr from-[#191970] to-[#3b3bcf] border border-white/20 shadow-lg shadow-black/35">
                  <PhoneCall className="h-7 w-7 text-white animate-bounce" style={{ animationDuration: "1.5s" }} />
                </span>
              </div>
              <p className="mt-5 text-xl font-bold tracking-tight text-white">{displayName}</p>
              <p className="mt-1 font-mono text-sm text-white/60">{displayPhone}</p>
              {contact ? (
                <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
                  <span className="rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-semibold text-white/80 border border-white/5">
                    {contact.company}
                  </span>
                  <CrmSourceTag label={contact.source} />
                </div>
              ) : null}
            </>
          ) : phase === "ended" ? (
            <>
              <div className="relative mt-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/15 backdrop-blur-sm overflow-hidden shadow-inner">
                <PhoneOff className="h-6 w-6 text-rose-450 relative z-10" />
              </div>
              <p className="mt-4 text-lg font-bold tracking-tight text-white">Call Ended</p>
              <p className="mt-1.5 font-mono text-sm text-white/50">{displayPhone}</p>
            </>
          ) : (
            <div className="flex flex-col items-center mt-3">
              <div className="relative flex items-center justify-center">
                <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#191970] to-[#2277ff] shadow-lg shadow-black/25 overflow-hidden border border-white/20">
                  {companyLogo ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={companyLogo} alt={companyName || "Company logo"} className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-2xl font-black text-white">
                      {companyName ? companyName.slice(0, 1).toUpperCase() : "C"}
                    </span>
                  )}
                </div>
                {/* Status Indicator (Green online dot at bottom-right corner of company logo) */}
                <span className="absolute -bottom-1 -right-1 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-[#12124a] p-0.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-ping absolute" />
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 relative z-10" />
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Body */}
      {phase === "idle" ? (
        <div className="flex flex-1 flex-col items-center justify-center bg-gradient-to-b from-slate-50/80 to-white dark:from-slate-950/40 dark:to-slate-900 px-6 py-12">
          <DialerKeypad
            value={dialedNumber}
            onDigit={onDigit}
            onBackspace={onBackspace}
            onChange={onChange}
            variant="light"
            showInput={true}
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
      ) : null}

      {phase === "dialing" || phase === "ringing" ? (
        <div className="flex-1 space-y-4 bg-white px-5 py-5 dark:bg-slate-900">
          {contact ? (
            <ProspectCard contact={contact} />
          ) : (
            <div className="rounded-2xl border border-slate-200/80 bg-gradient-to-br from-slate-50/80 to-white p-6 dark:border-slate-800 dark:from-slate-950/40 dark:to-slate-900 text-center py-10 shadow-sm animate-pulse">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Outgoing Call</p>
              <p className="mt-2 text-2xl font-bold font-mono tracking-wider text-slate-800 dark:text-slate-100">
                {displayPhone}
              </p>
              <p className="mt-3 text-xs text-slate-500 flex items-center justify-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-amber-500 animate-ping" />
                Connecting via Twilio SIP trunk...
              </p>
            </div>
          )}
          <button type="button" onClick={onCancel} className={cn(crm.btnSecondary, "w-full shadow-sm")}>
            <PhoneOff className="h-4 w-4" />
            Cancel call
          </button>
        </div>
      ) : null}

      {phase === "ended" ? (
        <div className="flex-1 flex flex-col items-center justify-center bg-white px-6 py-10 dark:bg-slate-900 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-rose-100 text-rose-600 dark:bg-rose-950/30 dark:text-rose-400 mb-4 animate-pulse">
            <PhoneOff className="h-8 w-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Call Ended</h3>
          <p className="mt-1 max-w-xs text-sm text-slate-500 leading-relaxed dark:text-slate-400">
            The connection was terminated. Please select a disposition in the dialog to save this session details to lead logs.
          </p>
          <div className="mt-6 flex flex-col gap-2.5 w-full max-w-xs">
            <button
              type="button"
              onClick={onCancel}
              className={cn(crm.btnPrimary, "w-full shadow-md")}
            >
              Back to keypad
            </button>
          </div>
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
                  className="rounded-md bg-slate-100 px-2 py-1 text-[10px] font-medium text-slate-650 hover:bg-[#191970]/10 hover:text-[#191970] dark:bg-slate-800 dark:text-slate-400"
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
          <p className="text-xs text-slate-550">{contact.title}</p>
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
    <div className="flex items-center gap-2 text-slate-650 dark:text-slate-400">
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
          : "border-slate-200/80 bg-white text-slate-650 shadow-sm hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300",
      )}
    >
      <Icon className="h-5 w-5" />
      {label}
    </button>
  );
}
