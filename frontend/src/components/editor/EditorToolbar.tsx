import { useEffect, useState } from "react";
import {
  Bold,
  Italic,
  Strikethrough,
  Minus,
  Plus,
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

function getActiveFontSize(editor: Editor): number {
  const currentFontSizeStr = editor.getAttributes("textStyle").fontSize;
  if (currentFontSizeStr) {
    const parsed = parseInt(currentFontSizeStr, 10);
    if (!isNaN(parsed)) return parsed;
  }
  if (editor.isActive("heading", { level: 1 })) return 32;
  if (editor.isActive("heading", { level: 2 })) return 24;
  if (editor.isActive("heading", { level: 3 })) return 20;
  return 16;
}

function FontSizeControl({ editor }: { editor: Editor }) {
  const currentSize = getActiveFontSize(editor);
  const [inputValue, setInputValue] = useState<string>(String(currentSize));

  useEffect(() => {
    setInputValue(String(currentSize));
  }, [currentSize]);

  const applySize = (newSize: number) => {
    const clamped = Math.max(8, Math.min(96, newSize));
    setInputValue(String(clamped));
    editor.chain().focus().setFontSize(`${clamped}px`).run();
  };

  const handleDecrease = () => {
    applySize(currentSize - 1);
  };

  const handleIncrease = () => {
    applySize(currentSize + 1);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const num = parseInt(inputValue, 10);
      if (!isNaN(num)) {
        applySize(num);
      } else {
        setInputValue(String(currentSize));
      }
      editor.commands.focus();
    }
  };

  const handleBlur = () => {
    const num = parseInt(inputValue, 10);
    if (!isNaN(num)) {
      applySize(num);
    } else {
      setInputValue(String(currentSize));
    }
  };

  return (
    <div className="flex items-center rounded-md border border-slate-200 bg-white shadow-2xs">
      <Tooltip>
        <TooltipTrigger
          render={
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                handleDecrease();
              }}
              aria-label="Decrease font size"
              className="inline-flex h-8 w-7 cursor-pointer items-center justify-center rounded-l-md text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
            >
              <Minus className="h-3.5 w-3.5" />
            </button>
          }
        />
        <TooltipContent side="bottom" className="flex items-center gap-2">
          <span>Decrease font size</span>
          <kbd className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] text-slate-500">
            ⌘⇧,
          </kbd>
        </TooltipContent>
      </Tooltip>

      <input
        type="text"
        inputMode="numeric"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        onFocus={(e) => e.target.select()}
        aria-label="Font size"
        className="h-8 w-9 border-x border-slate-200 bg-transparent text-center font-mono text-xs font-medium text-slate-800 transition-colors focus:bg-slate-50 focus:outline-none"
      />

      <Tooltip>
        <TooltipTrigger
          render={
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                handleIncrease();
              }}
              aria-label="Increase font size"
              className="inline-flex h-8 w-7 cursor-pointer items-center justify-center rounded-r-md text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          }
        />
        <TooltipContent side="bottom" className="flex items-center gap-2">
          <span>Increase font size</span>
          <kbd className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] text-slate-500">
            ⌘⇧.
          </kbd>
        </TooltipContent>
      </Tooltip>
    </div>
  );
}

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

    const handleShortcuts = (e: KeyboardEvent) => {
      const isMod = e.metaKey || e.ctrlKey;
      if (isMod && e.shiftKey && editor.isFocused) {
        if (e.key === "<" || e.key === ",") {
          e.preventDefault();
          const current = getActiveFontSize(editor);
          const next = Math.max(8, current - 1);
          editor.chain().focus().setFontSize(`${next}px`).run();
        } else if (e.key === ">" || e.key === ".") {
          e.preventDefault();
          const current = getActiveFontSize(editor);
          const next = Math.min(96, current + 1);
          editor.chain().focus().setFontSize(`${next}px`).run();
        }
      }
    };

    window.addEventListener("keydown", handleShortcuts);

    return () => {
      editor.off("transaction", handleUpdate);
      editor.off("selectionUpdate", handleUpdate);
      window.removeEventListener("keydown", handleShortcuts);
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
        <FontSizeControl editor={editor} />
        <Separator orientation="vertical" className="mx-1.5 h-6" />
        <ToolbarGroup actions={lists} editor={editor} />
        <Separator orientation="vertical" className="mx-1.5 h-6" />
        <ToolbarGroup actions={history} editor={editor} />
      </div>
    </div>
  );
}