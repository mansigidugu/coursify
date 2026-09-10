"use client";

import { useEffect, useRef, useState } from "react";
import Sidebar from "./Sidebar";
import CourseView from "./CourseView";
import ProgressSteps, { activeStepFromText } from "./ProgressSteps";
import { loadHistory, saveCourse, type SavedCourse } from "@/lib/history";

type Turn = {
  id: string;
  topic: string;
  phase: "loading" | "done" | "error";
  statusText: string;
  course: string;
  error: string;
};

const EXAMPLES = [
  "The history of jazz",
  "Intro to quantum computing",
  "How vaccines work",
  "Personal finance basics",
];

export default function ChatApp() {
  const [courses, setCourses] = useState<SavedCourse[]>([]);
  const [turns, setTurns] = useState<Turn[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Hydrate saved courses from localStorage — must happen client-side only,
    // after mount (localStorage doesn't exist during SSR).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCourses(loadHistory());
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [turns]);

  const updateTurn = (id: string, patch: Partial<Turn>) => {
    setTurns((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)));
  };

  const submit = async (value: string) => {
    const trimmed = value.trim();
    if (!trimmed || busy) return;

    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    setTurns((prev) => [
      ...prev,
      {
        id,
        topic: trimmed,
        phase: "loading",
        statusText: "Initializing AI squad...",
        course: "",
        error: "",
      },
    ]);
    setActiveId(null);
    setInput("");
    setBusy(true);

    try {
      const response = await fetch("/api/create-course", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: trimmed }),
      });

      if (!response.ok || !response.body) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { value: chunk, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(chunk, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.trim()) continue;
          const data = JSON.parse(line);
          if (data.type === "progress") {
            updateTurn(id, { statusText: data.text });
          } else if (data.type === "result") {
            updateTurn(id, { phase: "done", course: data.text });
            const updated = saveCourse(trimmed, data.text);
            setCourses(updated);
            setActiveId(updated[0]?.id ?? null);
          } else if (data.type === "error") {
            throw new Error(data.text);
          }
        }
      }
    } catch (err) {
      updateTurn(id, {
        phase: "error",
        error: err instanceof Error ? err.message : "Something went wrong.",
      });
    } finally {
      setBusy(false);
    }
  };

  const startNewChat = () => {
    setTurns([]);
    setActiveId(null);
    setMobileSidebarOpen(false);
  };

  const openSavedCourse = (saved: SavedCourse) => {
    setTurns([
      {
        id: saved.id,
        topic: saved.topic,
        phase: "done",
        course: saved.markdown,
        statusText: "",
        error: "",
      },
    ]);
    setActiveId(saved.id);
    setMobileSidebarOpen(false);
  };

  return (
    <div className="flex h-full w-full min-w-0">
      <aside className="hidden w-72 shrink-0 border-r border-border md:block">
        <Sidebar
          courses={courses}
          activeId={activeId}
          onNewChat={startNewChat}
          onSelect={openSavedCourse}
          onCoursesChange={setCourses}
        />
      </aside>

      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <button
            aria-label="Close sidebar"
            onClick={() => setMobileSidebarOpen(false)}
            className="absolute inset-0 bg-black/30 backdrop-blur-[2px]"
          />
          <div className="relative h-full w-72 max-w-[80vw] animate-fade-up border-r border-border bg-card shadow-xl">
            <Sidebar
              courses={courses}
              activeId={activeId}
              onNewChat={startNewChat}
              onSelect={openSavedCourse}
              onCoursesChange={setCourses}
              onCloseMobile={() => setMobileSidebarOpen(false)}
            />
          </div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-center gap-3 border-b border-border px-4 py-3 md:hidden">
          <button
            onClick={() => setMobileSidebarOpen(true)}
            className="text-foreground/80"
            aria-label="Open sidebar"
          >
            ☰
          </button>
          <span className="text-sm font-semibold">🎓 Coursify</span>
        </div>

        <div className="flex-1 overflow-y-auto">
          {turns.length === 0 ? (
            <EmptyState onExample={submit} />
          ) : (
            <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-8 sm:px-6">
              {turns.map((turn) => (
                <TurnBlock key={turn.id} turn={turn} />
              ))}
              <div ref={bottomRef} />
            </div>
          )}
        </div>

        <div className="border-t border-border px-4 py-4 sm:px-6">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              submit(input);
            }}
            className="mx-auto flex w-full max-w-3xl items-center gap-2"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={busy}
              placeholder="What do you want to learn?"
              autoComplete="off"
              className="w-full flex-1 rounded-full border border-border bg-card px-5 py-3 text-sm outline-none transition-shadow focus:ring-2 focus:ring-accent/40 disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={busy || !input.trim()}
              className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-accent to-accent-2 text-white shadow-sm transition-transform active:scale-95 disabled:opacity-50"
              aria-label="Send"
            >
              <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                <path
                  fillRule="evenodd"
                  d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

function EmptyState({ onExample }: { onExample: (topic: string) => void }) {
  return (
    <div className="flex h-full flex-col items-center justify-center px-6 text-center">
      <h1 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
        Turn any topic into a{" "}
        <span className="bg-gradient-to-r from-accent to-accent-2 bg-clip-text text-transparent">
          complete course
        </span>
      </h1>
      <p className="mt-3 max-w-md text-sm text-muted sm:text-base">
        Ask for any subject and a team of Claude-powered agents will research,
        fact-check, and write it for you.
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
        {EXAMPLES.map((example) => (
          <button
            key={example}
            onClick={() => onExample(example)}
            className="rounded-full border border-border bg-card px-3.5 py-1.5 text-sm text-muted transition-colors hover:border-accent/40 hover:text-foreground"
          >
            {example}
          </button>
        ))}
      </div>
    </div>
  );
}

function TurnBlock({ turn }: { turn: Turn }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex justify-end">
        <div className="max-w-[80%] rounded-2xl rounded-br-sm bg-gradient-to-r from-accent to-accent-2 px-4 py-2.5 text-sm text-white shadow-sm">
          {turn.topic}
        </div>
      </div>

      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border bg-card text-sm">
          🎓
        </div>
        <div className="min-w-0 flex-1">
          {turn.phase === "loading" && (
            <ProgressSteps
              compact
              statusText={turn.statusText}
              activeStep={activeStepFromText(turn.statusText)}
            />
          )}
          {turn.phase === "done" && <CourseView markdown={turn.course} />}
          {turn.phase === "error" && (
            <div className="animate-fade-up rounded-xl border border-red-300/40 bg-red-500/5 p-4 text-sm text-red-500">
              <p className="font-medium">Something went wrong.</p>
              <p className="mt-1 text-red-500/80">{turn.error}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
