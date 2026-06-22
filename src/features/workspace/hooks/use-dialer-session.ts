"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import {
  DEMO_CALL_LOG,
  DEMO_DIALER_QUEUE,
  type CallDisposition,
  type CallLogEntry,
  type DialerContact,
  normalizePhoneInput,
} from "@/features/workspace/data/crm-dialer-demo";

export type CallPhase = "idle" | "dialing" | "ringing" | "connected" | "ended";

type ActiveTarget =
  | { kind: "contact"; contact: DialerContact }
  | { kind: "manual"; phone: string; label?: string };

export type DialerSession = {
  phase: CallPhase;
  activeTarget: ActiveTarget | null;
  dialedNumber: string;
  callDurationSec: number;
  muted: boolean;
  onHold: boolean;
  showInCallKeypad: boolean;
  powerDial: boolean;
  queue: DialerContact[];
  callLog: CallLogEntry[];
  callNotes: string;
  pendingDisposition: boolean;
  sessionStats: {
    callsToday: number;
    connected: number;
    talkTimeSec: number;
    queueRemaining: number;
  };
  setDialedNumber: (value: string) => void;
  appendDigit: (digit: string) => void;
  backspace: () => void;
  setPowerDial: (value: boolean) => void;
  setCallNotes: (value: string) => void;
  setShowInCallKeypad: (value: boolean) => void;
  toggleMute: () => void;
  toggleHold: () => void;
  callContact: (contact: DialerContact) => void;
  callManual: () => void;
  cancelCall: () => void;
  endCall: () => void;
  submitDisposition: (disposition: CallDisposition, notesOverride?: string) => void;
  skipQueueItem: (contactId: string) => void;
  startNextInQueue: () => void;
};

function pickConnectOutcome(): boolean {
  return Math.random() > 0.28;
}

export function useDialerSession(): DialerSession {
  const [phase, setPhase] = useState<CallPhase>("idle");
  const [activeTarget, setActiveTarget] = useState<ActiveTarget | null>(null);
  const [dialedNumber, setDialedNumberState] = useState("");
  const [callDurationSec, setCallDurationSec] = useState(0);
  const [muted, setMuted] = useState(false);
  const [onHold, setOnHold] = useState(false);
  const [showInCallKeypad, setShowInCallKeypad] = useState(false);
  const [powerDial, setPowerDial] = useState(true);
  const [queue, setQueue] = useState<DialerContact[]>(DEMO_DIALER_QUEUE);
  const [callLog, setCallLog] = useState<CallLogEntry[]>(DEMO_CALL_LOG);
  const [callNotes, setCallNotes] = useState("");
  const [pendingDisposition, setPendingDisposition] = useState(false);

  const timersRef = useRef<number[]>([]);
  const durationTimerRef = useRef<number | null>(null);
  const connectStartRef = useRef<number>(0);
  const queueRef = useRef(queue);
  queueRef.current = queue;

  const clearTimers = useCallback(() => {
    timersRef.current.forEach((id) => window.clearTimeout(id));
    timersRef.current = [];
    if (durationTimerRef.current != null) {
      window.clearInterval(durationTimerRef.current);
      durationTimerRef.current = null;
    }
  }, []);

  useEffect(() => () => clearTimers(), [clearTimers]);

  const resetCallControls = useCallback(() => {
    setMuted(false);
    setOnHold(false);
    setShowInCallKeypad(false);
    setCallDurationSec(0);
  }, []);

  const markQueueStatus = useCallback((contactId: string, status: DialerContact["queueStatus"]) => {
    setQueue((prev) =>
      prev.map((c) => (c.id === contactId ? { ...c, queueStatus: status, lastCalled: "Just now" } : c)),
    );
  }, []);

  const beginOutbound = useCallback(
    (target: ActiveTarget) => {
      if (phase !== "idle" && phase !== "ended") return;
      clearTimers();
      resetCallControls();
      setCallNotes("");
      setPendingDisposition(false);
      setActiveTarget(target);
      setPhase("dialing");

      if (target.kind === "contact") {
        markQueueStatus(target.contact.id, "calling");
      }

      const dialTimer = window.setTimeout(() => setPhase("ringing"), 900);
      timersRef.current.push(dialTimer);

      const ringTimer = window.setTimeout(() => {
        if (pickConnectOutcome()) {
          setPhase("connected");
          connectStartRef.current = Date.now();
          durationTimerRef.current = window.setInterval(() => {
            setCallDurationSec((s) => s + 1);
          }, 1000);
        } else {
          setPhase("ended");
          if (target.kind === "contact") {
            markQueueStatus(target.contact.id, "no_answer");
          }
          setPendingDisposition(true);
        }
      }, 2400);
      timersRef.current.push(ringTimer);
    },
    [clearTimers, markQueueStatus, phase, resetCallControls],
  );

  const callContact = useCallback(
    (contact: DialerContact) => {
      beginOutbound({ kind: "contact", contact });
    },
    [beginOutbound],
  );

  const callManual = useCallback(() => {
    const phone = normalizePhoneInput(dialedNumber);
    if (phone.length < 8) return;
    beginOutbound({ kind: "manual", phone, label: phone });
  }, [beginOutbound, dialedNumber]);

  const cancelCall = useCallback(() => {
    clearTimers();
    resetCallControls();
    if (activeTarget?.kind === "contact") {
      markQueueStatus(activeTarget.contact.id, "pending");
    }
    setPhase("idle");
    setActiveTarget(null);
    setPendingDisposition(false);
  }, [activeTarget, clearTimers, markQueueStatus, resetCallControls]);

  const endCall = useCallback(() => {
    clearTimers();
    setPhase("ended");
    setPendingDisposition(true);
  }, [clearTimers]);

  const submitDisposition = useCallback(
    (disposition: CallDisposition, notesOverride?: string) => {
      const resolvedNotes = (notesOverride ?? callNotes).trim();
      const phone =
        activeTarget?.kind === "contact"
          ? activeTarget.contact.phone
          : activeTarget?.kind === "manual"
            ? activeTarget.phone
            : dialedNumber;
      const name =
        activeTarget?.kind === "contact"
          ? activeTarget.contact.name
          : activeTarget?.kind === "manual"
            ? activeTarget.label ?? "Manual dial"
            : "Unknown";
      const company = activeTarget?.kind === "contact" ? activeTarget.contact.company : "—";
      const contactId = activeTarget?.kind === "contact" ? activeTarget.contact.id : `manual-${Date.now()}`;

      const entry: CallLogEntry = {
        id: `cl-${Date.now()}`,
        contactId,
        contactName: name,
        phone,
        company,
        direction: "outbound",
        disposition,
        durationSec: callDurationSec,
        notes: resolvedNotes || undefined,
        startedAt: "Just now",
      };

      setCallLog((prev) => [entry, ...prev]);

      if (activeTarget?.kind === "contact") {
        const nextStatus: DialerContact["queueStatus"] =
          disposition === "no_answer" || disposition === "busy"
            ? "no_answer"
            : disposition === "not_interested" || disposition === "wrong_number"
              ? "skipped"
              : "completed";
        markQueueStatus(activeTarget.contact.id, nextStatus);
      }

      setPhase("idle");
      setActiveTarget(null);
      setPendingDisposition(false);
      setCallNotes("");
      resetCallControls();
      setDialedNumberState("");

      if (powerDial) {
        window.setTimeout(() => {
          const next = queueRef.current.find((c) => c.queueStatus === "pending");
          if (next) callContact(next);
        }, 700);
      }
    },
    [
      activeTarget,
      callDurationSec,
      callNotes,
      callContact,
      dialedNumber,
      markQueueStatus,
      powerDial,
      resetCallControls,
    ],
  );

  const skipQueueItem = useCallback((contactId: string) => {
    setQueue((prev) =>
      prev.map((c) => (c.id === contactId ? { ...c, queueStatus: "skipped" as const } : c)),
    );
  }, []);

  const startNextInQueue = useCallback(() => {
    const next = queue.find((c) => c.queueStatus === "pending");
    if (next) callContact(next);
  }, [callContact, queue]);

  const setDialedNumber = useCallback((value: string) => {
    setDialedNumberState(normalizePhoneInput(value));
  }, []);

  const appendDigit = useCallback((digit: string) => {
    setDialedNumberState((prev) => normalizePhoneInput(prev + digit));
  }, []);

  const backspace = useCallback(() => {
    setDialedNumberState((prev) => prev.slice(0, -1));
  }, []);

  const todayLog = callLog.filter((c) => c.startedAt.startsWith("Today") || c.startedAt === "Just now");
  const connected = todayLog.filter((c) => c.disposition === "connected").length;
  const talkTimeSec = todayLog.reduce((sum, c) => sum + c.durationSec, 0);
  const queueRemaining = queue.filter((c) => c.queueStatus === "pending").length;

  return {
    phase,
    activeTarget,
    dialedNumber,
    callDurationSec,
    muted,
    onHold,
    showInCallKeypad,
    powerDial,
    queue,
    callLog,
    callNotes,
    pendingDisposition,
    sessionStats: {
      callsToday: todayLog.length,
      connected,
      talkTimeSec,
      queueRemaining,
    },
    setDialedNumber,
    appendDigit,
    backspace,
    setPowerDial,
    setCallNotes,
    setShowInCallKeypad,
    toggleMute: () => setMuted((m) => !m),
    toggleHold: () => setOnHold((h) => !h),
    callContact,
    callManual,
    cancelCall,
    endCall,
    submitDisposition,
    skipQueueItem,
    startNextInQueue,
  };
}
