export const URL = {
  LOGIN: "/api/login",
  REGISTER: "/api/users",
  SESSIONS: "/api/sessions",
  SESSION: (id: number) => `/api/sessions/${id}`,
} as const;
