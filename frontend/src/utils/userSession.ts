export interface UserSession {
  id: string;
  name: string;
  color: string;
}

export const COLLAB_PALETTE = [
  "#6366f1", // Indigo
  "#10b981", // Emerald
  "#f43f5e", // Rose
  "#d97706", // Amber
  "#8b5cf6", // Violet
  "#06b6d4", // Cyan
  "#ea580c", // Orange
  "#ec4899", // Pink
  "#14b8a6", // Teal
  "#3b82f6", // Blue
];

const DEFAULT_NAMES = [
  "Tanmay",
  "Alex",
  "Sam",
  "Jordan",
  "Morgan",
  "Casey",
  "Taylor",
  "Riley",
  "Jamie",
  "Quinn",
];

const STORAGE_KEY = "syncwrite_user_session";

export function getOrCreateUserSession(): UserSession {
  if (typeof window === "undefined") {
    return { id: "server", name: "Tanmay", color: "#6366f1" };
  }

  try {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed.id && parsed.name && parsed.color) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn("Failed to read user session from sessionStorage", e);
  }

  // Generate a distinct color and name for this browser tab/session
  const color = COLLAB_PALETTE[Math.floor(Math.random() * COLLAB_PALETTE.length)];
  const nameBase = DEFAULT_NAMES[Math.floor(Math.random() * DEFAULT_NAMES.length)];
  const randomSuffix = Math.floor(Math.random() * 900 + 100);
  const name = `${nameBase} ${randomSuffix}`;
  const id = `user_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  const newSession: UserSession = { id, name, color };

  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(newSession));
  } catch (e) {
    console.warn("Failed to save user session to sessionStorage", e);
  }

  return newSession;
}

export function saveUserSession(session: UserSession): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  } catch (e) {
    console.warn("Failed to save user session", e);
  }
}
