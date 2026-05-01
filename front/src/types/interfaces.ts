import type { ReactNode } from "react";

export type Day = "lun" | "mar" | "mer" | "jeu" | "ven" | "sam" | "dim";

export type Discipline = "swim" | "bike" | "run" | "gym" | "rest";

// Le type du contexte : ce qu'on expose à toute l'app
export interface AuthContextType {
  token: string | null;
  login: (token: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

export interface Session {
  id: number;
  day: Day;
  discipline: Discipline;
  description: string | null;
  position: number;
}

export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
}

export interface TCreateSessionForm {
  onCreated: () => Promise<void>;
  defaultDay?: Day;
}
export interface TModalCreateSession {
  onClose: () => void;
  children: ReactNode;
}

export interface TSessionCard {
  session: Session;
  onUpdated: () => Promise<void>;
}

export interface TDays {
  day: Day;
  sessions: Session[];
  onUpdated: () => Promise<void>;
  onAdd: (day: Day) => void;
  loading?: boolean;
}

export type SessionsByDay = Record<Day, Session[]>;
