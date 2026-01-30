import { spawn, spawnSync } from "child_process";
import { getEditor, getCodingAgent } from "./paths";

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

export function openCodingAgent(path: string): boolean {
  const agent = getCodingAgent();
  if (!agent) {
    return false;
  }

  spawnSync(agent, [], {
    cwd: path,
    stdio: "inherit",
  });
  return true;
}

export function openTerminal(path: string): void {
  const shell = process.env.SHELL || "/bin/sh";
  spawnSync(shell, [], {
    cwd: path,
    stdio: "inherit",
  });
}
