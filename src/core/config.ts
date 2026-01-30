import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { join, resolve } from "path";
import type { DevHubConfig } from "./types";

export function getDevHubRoot(): string | undefined {
  return process.env.DEVHUB_ROOT;
}

export function resolveRootDir(cliArg?: string): string {
  if (cliArg) {
    return resolve(cliArg);
  }

  const envRoot = getDevHubRoot();
  if (envRoot) {
    return resolve(envRoot);
  }

  return process.cwd();
}

export function getConfigDir(rootDir: string): string {
  return join(rootDir, ".devhub");
}

export function getConfigPath(rootDir: string): string {
  return join(getConfigDir(rootDir), "config.json");
}

export function ensureConfigDir(rootDir: string): void {
  const configDir = getConfigDir(rootDir);
  if (!existsSync(configDir)) {
    mkdirSync(configDir, { recursive: true });
  }
}

export function loadConfig(rootDir: string): DevHubConfig {
  const configPath = getConfigPath(rootDir);

  if (!existsSync(configPath)) {
    return { projects: {} };
  }

  try {
    const data = readFileSync(configPath, "utf-8");
    return JSON.parse(data) as DevHubConfig;
  } catch {
    return { projects: {} };
  }
}

export function saveConfig(rootDir: string, config: DevHubConfig): void {
  ensureConfigDir(rootDir);
  const configPath = getConfigPath(rootDir);
  writeFileSync(configPath, JSON.stringify(config, null, 2));
}
