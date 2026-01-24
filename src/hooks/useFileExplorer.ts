import { createSignal, createMemo } from "solid-js";
import { getHomeDir, listDirectory, getParentDir, joinPath } from "../core/filesystem";

export function useFileExplorer() {
  const [path, setPath] = createSignal(getHomeDir());
  const [selectedIndex, setSelectedIndex] = createSignal(0);

  const entries = createMemo(() => listDirectory(path()));

  function reset() {
    setPath(getHomeDir());
    setSelectedIndex(0);
  }

  function moveUp() {
    setSelectedIndex((i) => Math.max(0, i - 1));
  }

  function moveDown() {
    setSelectedIndex((i) => Math.min(entries().length - 1, i + 1));
  }

  function navigateUp() {
    setPath(getParentDir(path()));
    setSelectedIndex(0);
  }

  function navigateInto() {
    const selected = entries()[selectedIndex()];
    if (selected?.isDirectory) {
      setPath(joinPath(path(), selected.name));
      setSelectedIndex(0);
    }
  }

  function getSelectedPath(): string | null {
    const selected = entries()[selectedIndex()];
    if (!selected) return null;
    return joinPath(path(), selected.name);
  }

  return {
    path,
    entries,
    selectedIndex,
    reset,
    moveUp,
    moveDown,
    navigateUp,
    navigateInto,
    getSelectedPath,
  };
}
