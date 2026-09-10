"use client";

import { deleteCourse, type SavedCourse } from "@/lib/history";

export default function Sidebar({
  courses,
  activeId,
  onNewChat,
  onSelect,
  onCoursesChange,
  onCloseMobile,
}: {
  courses: SavedCourse[];
  activeId: string | null;
  onNewChat: () => void;
  onSelect: (course: SavedCourse) => void;
  onCoursesChange: (courses: SavedCourse[]) => void;
  onCloseMobile?: () => void;
}) {
  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    onCoursesChange(deleteCourse(id));
  };

  return (
    <div className="flex h-full w-full flex-col bg-card">
      <div className="flex items-center justify-between gap-2 px-4 py-4">
        <span className="text-sm font-semibold tracking-tight">🎓 Coursify</span>
        {onCloseMobile && (
          <button
            onClick={onCloseMobile}
            className="text-muted transition-colors hover:text-foreground md:hidden"
            aria-label="Close sidebar"
          >
            ✕
          </button>
        )}
      </div>

      <div className="px-3">
        <button
          onClick={onNewChat}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-border px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:border-accent/40 hover:bg-accent/5"
        >
          <span className="text-base leading-none">+</span> New course
        </button>
      </div>

      <div className="mt-2 flex-1 overflow-y-auto px-3 py-2">
        {courses.length === 0 ? (
          <p className="px-2 py-6 text-center text-xs text-muted">
            Courses you create will show up here.
          </p>
        ) : (
          <ul className="flex flex-col gap-0.5">
            {courses.map((course) => (
              <li key={course.id}>
                <button
                  onClick={() => onSelect(course)}
                  className={[
                    "group flex w-full items-start justify-between gap-2 rounded-lg px-2.5 py-2 text-left transition-colors",
                    activeId === course.id ? "bg-accent/10" : "hover:bg-accent/5",
                  ].join(" ")}
                >
                  <span className="flex-1 overflow-hidden">
                    <span
                      className={[
                        "block truncate text-sm",
                        activeId === course.id
                          ? "font-medium text-foreground"
                          : "text-foreground/80",
                      ].join(" ")}
                    >
                      {course.topic}
                    </span>
                  </span>
                  <span
                    role="button"
                    tabIndex={0}
                    onClick={(e) => handleDelete(e, course.id)}
                    className="shrink-0 rounded-full p-1 text-muted opacity-0 transition-opacity hover:text-red-500 group-hover:opacity-100"
                    aria-label={`Delete "${course.topic}"`}
                  >
                    🗑
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="border-t border-border px-4 py-3 text-center text-[11px] text-muted">
        Research from Wikipedia, synthesized by Claude.
      </div>
    </div>
  );
}
