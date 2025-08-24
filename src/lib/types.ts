export type PlanVisibility = "public" | "link" | "private";


export interface Plan {
  id: string;
  title: string;
  time_iso: string;
  place: string | null;
  lat: number | null;
  lng: number | null;
  emoji: string | null;
  chat_expires_at: string;
}

export interface Attendee {
  id: string;
  handle: string;
  plan_id: string;
}

export interface ChatMessage {
  id: string;
  plan_id: string;
  handle: string;
  message: string;
  created_at: string;
}

