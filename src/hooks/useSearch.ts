import { createSignal, createMemo, Accessor } from "solid-js";
import type { ProjectWithStatus } from "../core/types";

export function useSearch(projects: Accessor<ProjectWithStatus[]>) {
  const [query, setQuery] = createSignal("");
  const [isActive, setIsActive] = createSignal(false);

  const filtered = createMemo(() => {
    const q = query().toLowerCase();
    if (!q) return projects();
    return projects().filter(
      (p) => p.name.toLowerCase().includes(q) || p.path.toLowerCase().includes(q),
    );
  });

  function start() {
    setIsActive(true);
    setQuery("");
  }

  function stop() {
    setIsActive(false);
  }

  function clear() {
    setQuery("");
    setIsActive(false);
  }

  function appendChar(char: string) {
    setQuery((prev) => prev + char);
  }

  function backspace() {
    setQuery((prev) => prev.slice(0, -1));
  }

  return {
    query,
    isActive,
    filtered,
    start,
    stop,
    clear,
    appendChar,
    backspace,
  };
}
