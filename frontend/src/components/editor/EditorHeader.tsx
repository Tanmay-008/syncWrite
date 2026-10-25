import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FileText, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  CollaboratorAvatars,
  type Collaborator,
} from "./CollaboratorAvatars";
import { ShareModal } from "./ShareModal";
import { ConnectionBadge, type ConnectionStatus } from "./ConnectionBadge";

interface EditorHeaderProps {
  docId: string;
  status?: ConnectionStatus;
  collaborators?: Collaborator[];
  currentUser?: { name: string; color: string };
}

const mockCollaborators: Collaborator[] = [
  { id: "1", name: "Tanmay S", color: "#6366f1", isOnline: true },
  { id: "2", name: "Alex Chen", color: "#f43f5e", isOnline: true },
  { id: "3", name: "Jordan Lee", color: "#0ea5e9", isOnline: false },
];

export function EditorHeader({
  docId,
  status = "connected",
  collaborators = mockCollaborators,
  currentUser,
}: EditorHeaderProps) {
  const navigate = useNavigate();
  const [title, setTitle] = useState("Untitled Document");

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="flex h-14 items-center justify-between px-4">
        {/* Left: Back + Title */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/")}
            className="h-8 w-8 cursor-pointer rounded-lg text-slate-400 hover:text-slate-600"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-60 border-none bg-transparent text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none"
              placeholder="Untitled Document"
            />
          </div>
        </div>

        {/* Right: Current User Pill + Collaborators + Share + Status */}
        <div className="flex items-center gap-3">
          {currentUser && (
            <div className="hidden sm:flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-600">
              <span
                className="h-2 w-2 rounded-full ring-2 ring-white"
                style={{ backgroundColor: currentUser.color }}
              />
              <span className="font-medium text-slate-700 max-w-[120px] truncate">
                {currentUser.name} (You)
              </span>
            </div>
          )}
          <ConnectionBadge status={status} />
          <Separator orientation="vertical" className="h-6" />
          <CollaboratorAvatars collaborators={collaborators} />
          <ShareModal docId={docId} />
        </div>
      </div>
    </header>
  );
}
