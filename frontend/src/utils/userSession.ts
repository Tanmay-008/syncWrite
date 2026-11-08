export interface UserSession {
  id: string;
  name: string;
  color: string;
}

export const COLLAB_PALETTE = [
  "#6366f1",
  "#10b981",
  "#f43f5e",
  "#d97706",
  "#8b5cf6",
  "#06b6d4",
  "#ea580c",
  "#ec4899",
  "#14b8a6",
  "#3b82f6",
];

export function getUserColor(idOrName: string): string {
  let hash = 0;
  for (let i = 0; i < idOrName.length; i++) {
    hash = idOrName.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % COLLAB_PALETTE.length;
  return COLLAB_PALETTE[index];
}

