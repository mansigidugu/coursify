export type SavedCourse = {
  id: string;
  topic: string;
  markdown: string;
};

const STORAGE_KEY = "coursify-courses";

function readCourses(): SavedCourse[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function loadHistory(): SavedCourse[] {
  return readCourses();
}

export function saveCourse(topic: string, markdown: string): SavedCourse[] {
  const courses = readCourses();
  courses.unshift({
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    topic,
    markdown,
  });
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(courses.slice(0, 50)));
  }
  return courses;
}

export function deleteCourse(id: string): SavedCourse[] {
  const courses = readCourses().filter((c) => c.id !== id);
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(courses));
  }
  return courses;
}
