import {
  Bold,
  Italic,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Undo2,
  Redo2,
} from "lucide-react";
import { Toggle } from "@/components/ui/toggle";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ToolbarAction {
  icon: typeof Bold;
  label: string;
  shortcut?: string;
}

const textFormatting: ToolbarAction[] = [
  { icon: Bold, label: "Bold", shortcut: "⌘B" },
  { icon: Italic, label: "Italic", shortcut: "⌘I" },
  { icon: Strikethrough, label: "Strikethrough", shortcut: "⌘⇧X" },
];

const headings: ToolbarAction[] = [
  { icon: Heading1, label: "Heading 1", shortcut: "⌘⌥1" },
  { icon: Heading2, label: "Heading 2", shortcut: "⌘⌥2" },
  { icon: Heading3, label: "Heading 3", shortcut: "⌘⌥3" },
];

const lists: ToolbarAction[] = [
  { icon: List, label: "Bullet List", shortcut: "⌘⇧8" },
  { icon: ListOrdered, label: "Numbered List", shortcut: "⌘⇧7" },
];

const history: ToolbarAction[] = [
  { icon: Undo2, label: "Undo", shortcut: "⌘Z" },
  { icon: Redo2, label: "Redo", shortcut: "⌘⇧Z" },
];

function ToolbarGroup({ actions }: { actions: ToolbarAction[] }) {
  return (
    <div className="flex items-center gap-0.5">
      {actions.map((action) => (
        <Tooltip key={action.label}>
          <TooltipTrigger>
            <Toggle
              size="sm"
              aria-label={action.label}
              className="h-8 w-8 cursor-pointer rounded-md p-0 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 data-[state=on]:bg-slate-100 data-[state=on]:text-slate-900"
            >
              <action.icon className="h-4 w-4" />
            </Toggle>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="flex items-center gap-2">
            <span>{action.label}</span>
            {action.shortcut && (
              <kbd className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] text-slate-500">
                {action.shortcut}
              </kbd>
            )}
          </TooltipContent>
        </Tooltip>
      ))}
    </div>
  );
}

export function EditorToolbar() {
  return (
    <div className="sticky top-0 z-10 border-b border-slate-200 bg-white/80 backdrop-blur-sm">
      <div className="mx-auto flex max-w-4xl items-center gap-1 px-6 py-2">
        <ToolbarGroup actions={textFormatting} />
        <Separator orientation="vertical" className="mx-1.5 h-6" />
        <ToolbarGroup actions={headings} />
        <Separator orientation="vertical" className="mx-1.5 h-6" />
        <ToolbarGroup actions={lists} />
        <Separator orientation="vertical" className="mx-1.5 h-6" />
        <ToolbarGroup actions={history} />
      </div>
    </div>
  );
}
