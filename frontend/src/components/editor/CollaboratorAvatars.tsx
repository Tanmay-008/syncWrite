import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export interface Collaborator {
  id: string;
  name: string;
  avatarUrl?: string;
  color: string;
  isOnline: boolean;
}

interface CollaboratorAvatarsProps {
  collaborators: Collaborator[];
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function CollaboratorAvatars({
  collaborators,
}: CollaboratorAvatarsProps) {
  if (collaborators.length === 0) return null;

  return (
    <div className="flex items-center">
      <div className="flex -space-x-2">
        {collaborators.slice(0, 5).map((collaborator) => (
          <Tooltip key={collaborator.id}>
            <TooltipTrigger>
              <div className="relative">
                <Avatar className="h-8 w-8 border-2 border-white shadow-sm transition-transform hover:z-10 hover:scale-110">
                  <AvatarImage
                    src={collaborator.avatarUrl}
                    alt={collaborator.name}
                  />
                  <AvatarFallback
                    className="text-xs font-medium text-white"
                    style={{ backgroundColor: collaborator.color }}
                  >
                    {getInitials(collaborator.name)}
                  </AvatarFallback>
                </Avatar>
                {/* Status dot */}
                <span
                  className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white ${
                    collaborator.isOnline ? "bg-emerald-500" : "bg-slate-300"
                  }`}
                />
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs font-medium">{collaborator.name}</p>
              <p className="text-xs text-muted-foreground">
                {collaborator.isOnline ? "Editing now" : "Away"}
              </p>
            </TooltipContent>
          </Tooltip>
        ))}
      </div>

      {collaborators.length > 5 && (
        <span className="ml-2 text-xs font-medium text-slate-500">
          +{collaborators.length - 5} more
        </span>
      )}
    </div>
  );
}
