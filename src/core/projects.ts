import { existsSync, mkdirSync, readFileSync, writeFileSync, readdirSync, statSync } from "fs";
import { basename, resolve, join } from "path";
import { getConfigDir, getProjectsPath } from "./paths";
import type { Project, ProjectsData } from "./types";

function generateId(): string {
  return Math.random().toString(36).substring(2, 8);
}

function ensureConfigDir(): void {
  const configDir = getConfigDir();
  if (!existsSync(configDir)) {
    mkdirSync(configDir, { recursive: true });
  }
}

export function loadProjects(): Project[] {
  const projectsPath = getProjectsPath();

  if (!existsSync(projectsPath)) {
    return [];
  }

  const data = readFileSync(projectsPath, "utf-8");
  const parsed: ProjectsData = JSON.parse(data);
  return parsed.projects || [];
}

export function saveProjects(projects: Project[]): void {
  ensureConfigDir();
  const projectsPath = getProjectsPath();
  const data: ProjectsData = { projects };
  writeFileSync(projectsPath, JSON.stringify(data, null, 2));
}

function addSingleProject(absolutePath: string, projects: Project[]): Project | null {
  const existing = projects.find((p) => p.path === absolutePath);
  if (existing) {
    return null;
  }

  if (!existsSync(absolutePath)) {
    return null;
  }

  const project: Project = {
    id: generateId(),
    name: basename(absolutePath),
    path: absolutePath,
    addedAt: new Date().toISOString(),
  };

  return project;
}

export interface AddResult {
  added: Project[];
  skipped: string[];
  errors: string[];
}

export function addProjectsFromDirectory(inputPath: string): AddResult {
  const projects = loadProjects();
  const absolutePath = resolve(inputPath);
  const result: AddResult = { added: [], skipped: [], errors: [] };

  if (!existsSync(absolutePath)) {
    result.errors.push(`Path does not exist: ${absolutePath}`);
    return result;
  }

  const stat = statSync(absolutePath);
  if (!stat.isDirectory()) {
    result.errors.push(`Not a directory: ${absolutePath}`);
    return result;
  }

  const entries = readdirSync(absolutePath, { withFileTypes: true });
  const subdirs = entries.filter((e) => e.isDirectory() && !e.name.startsWith("."));

  for (const subdir of subdirs) {
    const subdirPath = join(absolutePath, subdir.name);

    const project = addSingleProject(subdirPath, projects);
    if (project) {
      projects.push(project);
      result.added.push(project);
    } else {
      result.skipped.push(`${subdir.name} (already exists)`);
    }
  }

  if (result.added.length > 0) {
    saveProjects(projects);
  }

  return result;
}

export function addProject(inputPath: string): Project {
  const projects = loadProjects();
  const absolutePath = resolve(inputPath);

  const existing = projects.find((p) => p.path === absolutePath);
  if (existing) {
    throw new Error(`Project already exists: ${existing.name}`);
  }

  if (!existsSync(absolutePath)) {
    throw new Error(`Path does not exist: ${absolutePath}`);
  }

  const project: Project = {
    id: generateId(),
    name: basename(absolutePath),
    path: absolutePath,
    addedAt: new Date().toISOString(),
  };

  projects.push(project);
  saveProjects(projects);

  return project;
}

export function removeProject(id: string): void {
  const projects = loadProjects();
  const index = projects.findIndex((p) => p.id === id);

  if (index === -1) {
    throw new Error(`Project not found: ${id}`);
  }

  projects.splice(index, 1);
  saveProjects(projects);
}

export function findProjectByName(name: string): Project | undefined {
  const projects = loadProjects();
  return projects.find((p) => p.name === name || p.id === name);
}

export function updateLastAccessed(id: string): void {
  const projects = loadProjects();
  const project = projects.find((p) => p.id === id);

  if (project) {
    project.lastAccessedAt = new Date().toISOString();
    saveProjects(projects);
  }
}
