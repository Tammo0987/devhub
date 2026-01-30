import { loadConfig, saveConfig } from "./config";
import { discoverProjects } from "./discovery";
import type { Project } from "./types";

export function loadProjects(rootDir: string): Project[] {
  return discoverProjects(rootDir);
}

export function updateLastAccessed(rootDir: string, projectName: string): void {
  const config = loadConfig(rootDir);

  if (!config.projects[projectName]) {
    config.projects[projectName] = {};
  }

  config.projects[projectName].lastAccessedAt = new Date().toISOString();
  saveConfig(rootDir, config);
}
