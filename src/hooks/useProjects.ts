import { createSignal, createResource, onMount } from "solid-js"
import type { Project, ProjectWithStatus, GitStatus } from "../core/types"
import { loadProjects, saveProjects, addProject as addProjectCore, removeProject as removeProjectCore, updateLastAccessed as updateLastAccessedCore, addProjectsFromDirectory } from "../core/projects"
import { getGitStatus } from "../core/git"

export function useProjects() {
  const [projects, setProjects] = createSignal<ProjectWithStatus[]>([])
  const [loading, setLoading] = createSignal(true)
  const [error, setError] = createSignal<string | null>(null)

  async function loadWithGitStatus() {
    setLoading(true)
    setError(null)
    
    try {
      const rawProjects = loadProjects()
      
      // Load git status for all projects in parallel
      const withStatus: ProjectWithStatus[] = await Promise.all(
        rawProjects.map(async (project) => {
          const git = await getGitStatus(project.path)
          return { ...project, git }
        })
      )
      
      // Sort by lastAccessedAt (most recent first), then by name
      withStatus.sort((a, b) => {
        const aTime = a.lastAccessedAt ? new Date(a.lastAccessedAt).getTime() : 0
        const bTime = b.lastAccessedAt ? new Date(b.lastAccessedAt).getTime() : 0
        if (aTime !== bTime) return bTime - aTime
        return a.name.localeCompare(b.name)
      })
      
      setProjects(withStatus)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }

  function refresh() {
    loadWithGitStatus()
  }

  function addProject(path: string): boolean {
    try {
      addProjectCore(path)
      refresh()
      return true
    } catch (e) {
      setError((e as Error).message)
      return false
    }
  }

  function addAllSubdirs(path: string): { added: number; skipped: number } {
    const result = addProjectsFromDirectory(path)
    if (result.errors.length > 0) {
      setError(result.errors.join(", "))
    }
    if (result.added.length > 0) {
      refresh()
    }
    return { added: result.added.length, skipped: result.skipped.length }
  }

  function removeProject(id: string): boolean {
    try {
      removeProjectCore(id)
      refresh()
      return true
    } catch (e) {
      setError((e as Error).message)
      return false
    }
  }

  function clearError() {
    setError(null)
  }

  function updateLastAccessed(id: string) {
    updateLastAccessedCore(id)
    // Update local state without full refresh
    setProjects(prev => prev.map(p => 
      p.id === id ? { ...p, lastAccessedAt: new Date().toISOString() } : p
    ))
  }

  onMount(() => {
    loadWithGitStatus()
  })

  return {
    projects,
    loading,
    error,
    refresh,
    addProject,
    addAllSubdirs,
    removeProject,
    updateLastAccessed,
    clearError,
  }
}
