import { homedir } from "os";
import { join } from "path";

export function getConfigDir(): string {
  const xdgConfig = process.env.XDG_CONFIG_HOME;
  if (xdgConfig) {
    return join(xdgConfig, "devhub");
  }
  return join(homedir(), ".config", "devhub");
}

export function getProjectsPath(): string {
  return join(getConfigDir(), "projects.json");
}

export function getEditor(): string | null {
  return process.env.EDITOR || process.env.VISUAL || null;
}

export function shortenPath(path: string): string {
  const home = homedir();
  if (path.startsWith(home)) {
    return "~" + path.slice(home.length);
  }
  return path;
}
