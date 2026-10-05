import { useState } from "react";

export function EditorCanvas() {
  const [content, setContent] = useState("");

  return (
    <div className="flex-1 bg-slate-50/50 px-6 py-10">
      <div className="mx-auto max-w-4xl">
        {/* Paper-like container */}
        <div className="min-h-[70vh] rounded-xl border border-slate-200 bg-white px-16 py-12 shadow-sm transition-shadow focus-within:shadow-md">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Start writing..."
            className="w-full resize-none bg-transparent text-base leading-relaxed text-slate-800 placeholder:text-slate-300 focus:outline-none"
            style={{ minHeight: "60vh", fontFamily: "'Geist Variable', sans-serif" }}
          />
        </div>
      </div>
    </div>
  );
}
