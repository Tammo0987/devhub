import { readdirSync, rmSync } from "fs";
import { homedir } from "os";
import { join, dirname } from "path";
import type { DirEntry } from "../components/FileExplorer";

export function getHomeDir(): string {
  return homedir();
}

export function listDirectory(path: string): DirEntry[] {
  try {
    const entries = readdirSync(path, { withFileTypes: true });

    const dirs = entries
      .filter((e) => e.isDirectory())
      .map((e) => ({
        name: e.name,
        isDirectory: true,
      }))
      .sort((a, b) => {
        const aHidden = a.name.startsWith(".");
        const bHidden = b.name.startsWith(".");
        if (aHidden && !bHidden) return 1;
        if (!aHidden && bHidden) return -1;
        return a.name.localeCompare(b.name);
      });

    return dirs;
  } catch {
    return [];
  }
}

export function getParentDir(path: string): string {
  const parent = dirname(path);
  if (parent === path) return path;
  return parent;
}

export function joinPath(base: string, name: string): string {
  return join(base, name);
}

export function deleteDirectory(path: string): boolean {
  try {
    rmSync(path, { recursive: true, force: true });
    return true;
  } catch {
    return false;
  }
}
