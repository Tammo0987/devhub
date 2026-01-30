import { readdirSync, statSync, existsSync } from "fs";
import { join } from "path";
import type { Project } from "./types";
import { loadConfig, saveConfig } from "./config";

export function discoverProjects(rootDir: string): Project[] {
  if (!existsSync(rootDir)) {
    return [];
  }

  const stat = statSync(rootDir);
  if (!stat.isDirectory()) {
    return [];
  }

  const config = loadConfig(rootDir);
  const projects: Project[] = [];

  try {
    const entries = readdirSync(rootDir, { withFileTypes: true });
    const subdirs = entries.filter((e) => e.isDirectory() && !e.name.startsWith("."));
    const existingNames = new Set(subdirs.map((s) => s.name));

    for (const subdir of subdirs) {
      const subdirPath = join(rootDir, subdir.name);
      const metadata = config.projects[subdir.name];

      const project: Project = {
        name: subdir.name,
        path: subdirPath,
        lastAccessedAt: metadata?.lastAccessedAt,
      };

      projects.push(project);
    }

    const staleNames = Object.keys(config.projects).filter((name) => !existingNames.has(name));
    if (staleNames.length > 0) {
      for (const name of staleNames) {
        delete config.projects[name];
      }
      saveConfig(rootDir, config);
    }
  } catch {
    return [];
  }

  return projects;
}
