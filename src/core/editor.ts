import { spawn, spawnSync } from "child_process";
import { getEditor } from "./paths";

export function openInEditor(path: string): boolean {
  const editor = getEditor();

  if (!editor) {
    return false;
  }

  const child = spawn(editor, [path], {
    detached: true,
    stdio: "ignore",
  });
  child.unref();
  return true;
}

export function openLazygit(path: string): void {
  spawnSync("lazygit", [], {
    cwd: path,
    stdio: "inherit",
  });
}
