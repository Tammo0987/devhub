import { homedir } from "os";

export function getEditor(): string | undefined {
  return process.env.EDITOR;
}

export function getCodingAgent(): string | undefined {
  return process.env.DEVHUB_AGENT;
}

export function shortenPath(path: string): string {
  const home = homedir();
  if (path.startsWith(home)) {
    return "~" + path.slice(home.length);
  }
  return path;
}
