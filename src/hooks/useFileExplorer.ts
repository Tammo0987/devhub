import { createSignal, createMemo } from "solid-js";
import { basename } from "path";
import { getHomeDir, listDirectory, getParentDir, joinPath } from "../core/filesystem";

export function useFileExplorer(initialPath?: string) {
  const [path, setPath] = createSignal(initialPath || getHomeDir());
  const [selectedIndex, setSelectedIndex] = createSignal(0);

  const entries = createMemo(() => listDirectory(path()));

  function reset(newPath?: string) {
    setPath(newPath || getHomeDir());
    setSelectedIndex(0);
  }

  function moveUp() {
    setSelectedIndex((i) => Math.max(0, i - 1));
  }

  function moveDown() {
    setSelectedIndex((i) => Math.min(entries().length - 1, i + 1));
  }

  function navigateUp() {
    const currentDir = basename(path());
    const parentPath = getParentDir(path());
    setPath(parentPath);

    const parentEntries = listDirectory(parentPath);
    const index = parentEntries.findIndex((e) => e.name === currentDir);
    setSelectedIndex(index >= 0 ? index : 0);
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

  function getCurrentPath(): string {
    return path();
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
    getCurrentPath,
  };
}
