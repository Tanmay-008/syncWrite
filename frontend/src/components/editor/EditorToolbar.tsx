import { useEffect, useState } from "react";
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
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Editor } from "@tiptap/react";

interface ToolbarAction {
  icon: typeof Bold;
  label: string;
  shortcut?: string;
  action: (editor: Editor) => void;
  isActive: (editor: Editor) => boolean;
  disabled?: (editor: Editor) => boolean;
}

const textFormatting: ToolbarAction[] = [
  { icon: Bold, label: "Bold", shortcut: "⌘B", action: (e) => e.chain().focus().toggleBold().run(), isActive: (e) => e.isActive("bold") },
  { icon: Italic, label: "Italic", shortcut: "⌘I", action: (e) => e.chain().focus().toggleItalic().run(), isActive: (e) => e.isActive("italic") },
  { icon: Strikethrough, label: "Strikethrough", shortcut: "⌘⇧X", action: (e) => e.chain().focus().toggleStrike().run(), isActive: (e) => e.isActive("strike") },
];

const headings: ToolbarAction[] = [
  { icon: Heading1, label: "Heading 1", shortcut: "⌘⌥1", action: (e) => e.chain().focus().toggleHeading({ level: 1 }).run(), isActive: (e) => e.isActive("heading", { level: 1 }) },
  { icon: Heading2, label: "Heading 2", shortcut: "⌘⌥2", action: (e) => e.chain().focus().toggleHeading({ level: 2 }).run(), isActive: (e) => e.isActive("heading", { level: 2 }) },
  { icon: Heading3, label: "Heading 3", shortcut: "⌘⌥3", action: (e) => e.chain().focus().toggleHeading({ level: 3 }).run(), isActive: (e) => e.isActive("heading", { level: 3 }) },
];

const lists: ToolbarAction[] = [
  { icon: List, label: "Bullet List", shortcut: "⌘⇧8", action: (e) => e.chain().focus().toggleBulletList().run(), isActive: (e) => e.isActive("bulletList") },
  { icon: ListOrdered, label: "Numbered List", shortcut: "⌘⇧7", action: (e) => e.chain().focus().toggleOrderedList().run(), isActive: (e) => e.isActive("orderedList") },
];

const history: ToolbarAction[] = [
  { icon: Undo2, label: "Undo", shortcut: "⌘Z", action: (e) => e.chain().focus().undo().run(), isActive: () => false, disabled: (e) => !e.can().undo() },
  { icon: Redo2, label: "Redo", shortcut: "⌘⇧Z", action: (e) => e.chain().focus().redo().run(), isActive: () => false, disabled: (e) => !e.can().redo() },
];

function ToolbarGroup({ actions, editor }: { actions: ToolbarAction[]; editor: Editor }) {
  return (
    <div className="flex items-center gap-0.5">
      {actions.map((action) => {
        const active = action.isActive(editor);
        const isDisabled = action.disabled?.(editor) ?? false;

        return (
          <Tooltip key={action.label}>
            <TooltipTrigger
              render={
                <button
                  type="button"
                  disabled={isDisabled}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    if (!isDisabled) {
                      action.action(editor);
                    }
                  }}
                  aria-label={action.label}
                  data-state={active ? "on" : "off"}
                  className={`inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-md p-0 transition-colors disabled:pointer-events-none disabled:opacity-40 ${active
                    ? "bg-slate-200 text-slate-900 font-semibold"
                    : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                    }`}
                >
                  <action.icon className="h-4 w-4" />
                </button>
              }
            />
            <TooltipContent side="bottom" className="flex items-center gap-2">
              <span>{action.label}</span>
              {action.shortcut && (
                <kbd className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] text-slate-500">
                  {action.shortcut}
                </kbd>
              )}
            </TooltipContent>
          </Tooltip>
        );
      })}
    </div>
  );
}

export function EditorToolbar({ editor }: { editor: Editor | null }) {
  const [, setTick] = useState(0);

  useEffect(() => {
    if (!editor) return;

    const handleUpdate = () => setTick((t) => t + 1);

    editor.on("transaction", handleUpdate);
    editor.on("selectionUpdate", handleUpdate);

    return () => {
      editor.off("transaction", handleUpdate);
      editor.off("selectionUpdate", handleUpdate);
    };
  }, [editor]);

  if (!editor) {
    return null;
  }

  return (
    <div className="sticky top-0 z-10 border-b border-slate-200 bg-white/80 backdrop-blur-sm">
      <div className="mx-auto flex max-w-4xl items-center gap-1 px-6 py-2">
        <ToolbarGroup actions={textFormatting} editor={editor} />
        <Separator orientation="vertical" className="mx-1.5 h-6" />
        <ToolbarGroup actions={headings} editor={editor} />
        <Separator orientation="vertical" className="mx-1.5 h-6" />
        <ToolbarGroup actions={lists} editor={editor} />
        <Separator orientation="vertical" className="mx-1.5 h-6" />
        <ToolbarGroup actions={history} editor={editor} />
      </div>
    </div>
  );
}