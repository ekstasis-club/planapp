export type PlanVisibility = "public" | "link" | "private";

export interface Plan {
  id: string;
  title: string;
  emoji: string;
  timeISO: string; // 2025-08-23T20:00:00.000Z
  place?: string;
  lat?: number;
  lng?: number;
  visibility: PlanVisibility;
  groupLink?: string;
  createdBy: string; // @instagram (texto)
  createdAt: number; // Date.now()
  expiresAt?: number;
}

export interface Attendee {
  id: string;
  planId: string;
  handle: string; // @usuario o 'anónimo'
  joinedAt: number;
}
