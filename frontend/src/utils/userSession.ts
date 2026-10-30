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

export function getUserColor(idOrName: string): string {
  let hash = 0;
  for (let i = 0; i < idOrName.length; i++) {
    hash = idOrName.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % COLLAB_PALETTE.length;
  return COLLAB_PALETTE[index];
}

