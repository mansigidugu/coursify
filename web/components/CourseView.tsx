"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function CourseView({ markdown }: { markdown: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard
      .writeText(markdown)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      })
      .catch(() => {});
  };

  return (
    <div className="w-full animate-fade-up">
      <article className="prose-course rounded-2xl border border-border bg-card p-5 sm:p-8">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdown}</ReactMarkdown>
      </article>
      <div className="mt-2 flex justify-end">
        <button
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3.5 py-1.5 text-xs font-medium text-muted transition-colors hover:border-accent/50 hover:text-accent"
        >
          {copied ? "Copied ✓" : "Copy markdown"}
        </button>
      </div>
    </div>
  );
}
