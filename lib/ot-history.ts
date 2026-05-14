import type { Intervention } from "./types";

const OT_HISTORY_KEY = "ocp-ot-pdf-history-v1";

export interface OtHistoryEntry {
  id: string;
  fileName: string;
  generatedAt: string;
  otNumber: number;
  reservationNumber: number;
  stockPhysiqueAvant: number;
  intervention: Intervention;
}

export function getOtHistory(): OtHistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(OT_HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as OtHistoryEntry[];
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

export function addOtHistoryEntry(entry: Omit<OtHistoryEntry, "id" | "generatedAt">) {
  if (typeof window === "undefined") return;
  const current = getOtHistory();
  const next: OtHistoryEntry[] = [
    {
      ...entry,
      id: `ot-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      generatedAt: new Date().toISOString(),
    },
    ...current,
  ].slice(0, 200);
  localStorage.setItem(OT_HISTORY_KEY, JSON.stringify(next));
}

