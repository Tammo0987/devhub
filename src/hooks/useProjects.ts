import { createSignal, createEffect, on, onMount } from "solid-js";
import type { Accessor } from "solid-js";
import type { ProjectWithStatus } from "../core/types";
import { loadProjects, updateLastAccessed as updateLastAccessedCore } from "../core/projects";
import { getGitStatus } from "../core/git";

export function useProjects(rootDir: Accessor<string>) {
  const [projects, setProjects] = createSignal<ProjectWithStatus[]>([]);
  const [loading, setLoading] = createSignal(true);
  const [error, setError] = createSignal<string | null>(null);

  async function loadWithGitStatus() {
    setLoading(true);
    setError(null);

    try {
      const rawProjects = loadProjects(rootDir());

      const withStatus: ProjectWithStatus[] = await Promise.all(
        rawProjects.map(async (project) => {
          const git = await getGitStatus(project.path);
          return { ...project, git };
        }),
      );

      withStatus.sort((a, b) => {
        const aTime = a.lastAccessedAt ? new Date(a.lastAccessedAt).getTime() : 0;
        const bTime = b.lastAccessedAt ? new Date(b.lastAccessedAt).getTime() : 0;
        if (aTime !== bTime) return bTime - aTime;
        return a.name.localeCompare(b.name);
      });

      setProjects(withStatus);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  function refresh() {
    loadWithGitStatus();
  }

  function clearError() {
    setError(null);
  }

  function updateLastAccessed(name: string) {
    updateLastAccessedCore(rootDir(), name);
    setProjects((prev) =>
      prev.map((p) => (p.name === name ? { ...p, lastAccessedAt: new Date().toISOString() } : p)),
    );
  }

  onMount(() => loadWithGitStatus());
  createEffect(on(rootDir, () => loadWithGitStatus(), { defer: true }));

  return {
    projects,
    loading,
    error,
    refresh,
    updateLastAccessed,
    clearError,
  };
}
