import { FileText, Users, Zap } from "lucide-react";
import { CreateDocButton } from "./CreateDocButton";

const features = [
  {
    icon: Zap,
    title: "Real-Time Sync",
    description: "Changes appear instantly across all connected editors.",
  },
  {
    icon: Users,
    title: "Live Collaboration",
    description: "See who's editing and where their cursor is in real time.",
  },
  {
    icon: FileText,
    title: "Clean Canvas",
    description: "A distraction-free writing surface built for focus.",
  },
];

export function HeroSection() {
  return (
    <section className="flex flex-col items-center justify-center px-6 pt-32 pb-20">

      {/* Title */}
      <h1 className="max-w-3xl text-center text-5xl leading-tight font-bold tracking-tight text-slate-900 sm:text-6xl">
        Write together,{" "}
        <span className="bg-gradient-to-r from-slate-900 via-slate-700 to-slate-500 bg-clip-text text-transparent">
          in real time.
        </span>
      </h1>

      {/* Subtitle */}
      <p className="mt-5 max-w-xl text-center text-lg leading-relaxed text-slate-500">
        A minimal, fast collaborative editor. Create a document, share the link,
        and start writing with your team — no sign-up required.
      </p>

      {/* CTA */}
      <div className="mt-10">
        <CreateDocButton />
      </div>

      {/* Feature Cards */}
      <div className="mt-20 grid w-full max-w-4xl grid-cols-1 gap-5 sm:grid-cols-3">
        {features.map((feature) => (
          <div
            key={feature.title}
            className="group rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-200 hover:border-slate-300 hover:shadow-md"
          >
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-700 transition-colors group-hover:bg-slate-900 group-hover:text-white">
              <feature.icon className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-semibold text-slate-900">
              {feature.title}
            </h3>
            <p className="mt-1.5 text-sm leading-relaxed text-slate-500">
              {feature.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
