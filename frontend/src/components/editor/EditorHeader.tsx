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

export function EditorHeader({
  docId,
  status = "connected",
  collaborators = [],
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
            <div className="hidden sm:flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 py-1 pl-1.5 pr-3 text-xs text-slate-700 shadow-xs">
              <span
                className="flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold text-white shadow-xs"
                style={{ backgroundColor: currentUser.color }}
              >
                {currentUser.name.charAt(0).toUpperCase()}
              </span>
              <span className="font-medium max-w-[120px] truncate">
                {currentUser.name} <span className="text-slate-400 font-normal">(You)</span>
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
