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

const STORAGE_KEY = "syncwrite_user_session";

export function getOrCreateUserSession(): UserSession {
  if (typeof window === "undefined") {
    return { id: "guest", name: "Guest", color: "#6366f1" };
  }

  try {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed.id && parsed.name === "Guest" && parsed.color) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn("Failed to read user session from sessionStorage", e);
  }

  // Generate a distinct color for this guest session
  const color = COLLAB_PALETTE[Math.floor(Math.random() * COLLAB_PALETTE.length)];
  const id = `guest_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const newSession: UserSession = { id, name: "Guest", color };

  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(newSession));
  } catch (e) {
    console.warn("Failed to save user session to sessionStorage", e);
  }

  return newSession;
}

export function getUserColor(idOrName: string): string {
  let hash = 0;
  for (let i = 0; i < idOrName.length; i++) {
    hash = idOrName.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % COLLAB_PALETTE.length;
  return COLLAB_PALETTE[index];
}
