import type { SessionsByDay } from "../types/interfaces";
import api from "./axios";
import { URL } from "./routes";

export async function fetchSessions(): Promise<SessionsByDay> {
  const response = await api.get(URL.SESSIONS);
  return response.data;
}

export async function createSession(data: {
  day: string;
  discipline: string;
  description: string;
}): Promise<void> {
  await api.post(URL.SESSIONS, data);
}
export async function deleteSession(id: number): Promise<void> {
  await api.delete(URL.SESSION(id));
}

export async function updateSession(
  id: number,
  data: {
    day?: string;
    discipline?: string;
    description?: string;
    position?: number;
  },
): Promise<void> {
  await api.patch(URL.SESSION(id), data);
}
