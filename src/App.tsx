import { createSignal, createMemo, Show } from "solid-js"
import { useKeyboard, useRenderer } from "@opentui/solid"
import { ProjectList } from "./components/ProjectList"
import { StatusBar } from "./components/StatusBar"
import { Header } from "./components/Header"
import { FileExplorer, type DirEntry } from "./components/FileExplorer"
import { useProjects } from "./hooks/useProjects"
import { openInEditor, openLazygit } from "./core/editor"
import { getHomeDir, listDirectory, getParentDir, joinPath, deleteDirectory } from "./core/filesystem"
import { colors } from "./theme"

type Mode = "normal" | "add" | "search" | "delete-confirm"

export function App() {
  const { projects, loading, error, refresh, addProject, addAllSubdirs, removeProject, updateLastAccessed, clearError } = useProjects()
  const [selectedIndex, setSelectedIndex] = createSignal(0)
  const [mode, setMode] = createSignal<Mode>("normal")
  const [statusMessage, setStatusMessage] = createSignal<string | undefined>()
  const [searchQuery, setSearchQuery] = createSignal("")
  const [deleteTarget, setDeleteTarget] = createSignal<{ id: string; name: string; path: string } | null>(null)
  const renderer = useRenderer()

  // File explorer state
  const [explorerPath, setExplorerPath] = createSignal(getHomeDir())
  const [explorerIndex, setExplorerIndex] = createSignal(0)
  const explorerEntries = createMemo(() => listDirectory(explorerPath()))

  const filteredProjects = createMemo(() => {
    const query = searchQuery().toLowerCase()
    if (!query) return projects()
    return projects().filter(p => 
      p.name.toLowerCase().includes(query) || 
      p.path.toLowerCase().includes(query)
    )
  })

  function showMessage(msg: string, duration = 2000) {
    setStatusMessage(msg)
    setTimeout(() => setStatusMessage(undefined), duration)
  }

  function selectedProject() {
    const list = filteredProjects()
    if (list.length === 0) return null
    return list[selectedIndex()] || null
  }

  function moveUp() {
    setSelectedIndex((i) => Math.max(0, i - 1))
  }

  function moveDown() {
    setSelectedIndex((i) => Math.min(filteredProjects().length - 1, i + 1))
  }

  function exitApp() {
    renderer.destroy()
    process.exit(0)
  }

  function handleOpen() {
    const project = selectedProject()
    if (!project) return
    
    if (!openInEditor(project.path)) {
      showMessage("Set $EDITOR to open projects")
      return
    }
    updateLastAccessed(project.id)
    handleSearchClear()
  }

  function handleLazygit() {
    const project = selectedProject()
    if (!project) return
    if (!project.git.isRepo) {
      showMessage("Not a git repository")
      return
    }
    
    updateLastAccessed(project.id)
    
    // Suspend TUI, open lazygit, then resume and refresh
    renderer.suspend()
    openLazygit(project.path)
    renderer.resume()
    refresh()
  }

  function handleDelete() {
    const project = selectedProject()
    if (!project) return
    
    // Enter delete confirmation mode
    setDeleteTarget({ id: project.id, name: project.name, path: project.path })
    setMode("delete-confirm")
  }

  function handleDeleteConfirm(alsoDeleteFiles: boolean) {
    const target = deleteTarget()
    if (!target) return
    
    if (alsoDeleteFiles) {
      if (!deleteDirectory(target.path)) {
        showMessage(`Failed to delete files: ${target.path}`)
      }
    }
    
    if (removeProject(target.id)) {
      showMessage(alsoDeleteFiles ? `Deleted: ${target.name}` : `Removed: ${target.name}`)
      // Adjust selection if needed
      if (selectedIndex() >= filteredProjects().length) {
        setSelectedIndex(Math.max(0, filteredProjects().length - 1))
      }
    }
    setDeleteTarget(null)
    setMode("normal")
  }

  function handleDeleteCancel() {
    setDeleteTarget(null)
    setMode("normal")
  }

  function getSelectedPath(): string | null {
    const entries = explorerEntries()
    const selected = entries[explorerIndex()]
    if (!selected) return null
    return joinPath(explorerPath(), selected.name)
  }

  function handleAddSubmit() {
    const path = getSelectedPath()
    if (!path) {
      showMessage("No directory selected")
      return
    }
    
    if (addProject(path)) {
      showMessage(`Added project: ${path}`)
      setSelectedIndex(projects().length - 1)
    } else {
      showMessage(error() || "Failed to add project")
      clearError()
    }
    setExplorerPath(getHomeDir())
    setExplorerIndex(0)
    setMode("normal")
  }

  function handleAddAllSubdirs() {
    const path = getSelectedPath()
    if (!path) {
      showMessage("No directory selected")
      return
    }
    
    const result = addAllSubdirs(path)
    if (result.added > 0) {
      showMessage(`Added ${result.added} project${result.added !== 1 ? "s" : ""}${result.skipped > 0 ? `, ${result.skipped} skipped` : ""}`)
    } else if (result.skipped > 0) {
      showMessage(`All ${result.skipped} projects already exist`)
    } else {
      showMessage("No subdirectories found")
    }
    setExplorerPath(getHomeDir())
    setExplorerIndex(0)
    setMode("normal")
  }

  function handleAddCancel() {
    setExplorerPath(getHomeDir())
    setExplorerIndex(0)
    setMode("normal")
  }

  function handleSearchClear() {
    setSearchQuery("")
    setSelectedIndex(0)
    setMode("normal")
  }

  useKeyboard((key) => {
    // Handle Ctrl+C always
    if (key.ctrl && key.name === "c") {
      exitApp()
    }

    // Handle add mode - file explorer navigation
    if (mode() === "add") {
      const entries = explorerEntries()
      if (key.name === "escape") {
        handleAddCancel()
      } else if (key.name === "return" && key.shift) {
        // Shift+Enter: Add all subdirectories
        handleAddAllSubdirs()
      } else if (key.name === "return") {
        // Enter: Add current directory
        handleAddSubmit()
      } else if (key.name === "up" || key.name === "k") {
        setExplorerIndex(i => Math.max(0, i - 1))
      } else if (key.name === "down" || key.name === "j") {
        setExplorerIndex(i => Math.min(entries.length - 1, i + 1))
      } else if (key.name === "backspace" || key.name === "h" || key.name === "left") {
        setExplorerPath(getParentDir(explorerPath()))
        setExplorerIndex(0)
      } else if (key.name === "l" || key.name === "right") {
        // Enter selected directory
        const selected = entries[explorerIndex()]
        if (selected && selected.isDirectory) {
          setExplorerPath(joinPath(explorerPath(), selected.name))
          setExplorerIndex(0)
        }
      }
      return
    }

    // Handle delete confirmation mode
    if (mode() === "delete-confirm") {
      if (key.name === "escape" || key.name === "n") {
        handleDeleteCancel()
      } else if (key.name === "y") {
        // y = remove from list only
        handleDeleteConfirm(false)
      } else if (key.name === "d" && key.shift) {
        // Shift+D = also delete files
        handleDeleteConfirm(true)
      }
      return
    }

    // Handle search mode - manually handle typing
    if (mode() === "search") {
      if (key.name === "escape") {
        handleSearchClear()
      } else if (key.name === "return") {
        setMode("normal")
      } else if (key.name === "backspace") {
        setSearchQuery(prev => prev.slice(0, -1))
        setSelectedIndex(0)
      } else if (key.sequence && key.sequence.length === 1 && !key.ctrl && !key.meta) {
        setSearchQuery(prev => prev + key.sequence)
        setSelectedIndex(0)
      }
      return
    }

    // Normal mode keybindings
    switch (key.name) {
      case "escape":
        // Clear search filter if active
        if (searchQuery()) {
          handleSearchClear()
        }
        break
      case "up":
      case "k":
        moveUp()
        break
      case "down":
      case "j":
        moveDown()
        break
      case "return":
        handleOpen()
        break
      case "a":
        setMode("add")
        break
      case "d":
        handleDelete()
        break
      case "g":
        handleLazygit()
        break
      case "r":
        refresh()
        break
      case "q":
        exitApp()
        break
    }

    // "/" to start search
    if (key.sequence === "/") {
      setMode("search")
      setSearchQuery("")
      setSelectedIndex(0)
    }
  })

  return (
    <box
      width="100%"
      height="100%"
      flexDirection="column"
      backgroundColor={colors.base}
    >
      {/* Header */}
      <Header loading={loading()} projectCount={filteredProjects().length} />

      {/* File explorer for add mode */}
      <Show when={mode() === "add"}>
        <FileExplorer
          currentPath={explorerPath()}
          entries={explorerEntries()}
          selectedIndex={explorerIndex()}
        />
      </Show>

      {/* Search bar */}
      <Show when={mode() === "search" || searchQuery()}>
        <box
          height={1}
          width="100%"
          paddingLeft={1}
          backgroundColor={colors.surface0}
          flexDirection="row"
        >
          <text fg={colors.mauve}>/</text>
          <text fg={colors.text}>{searchQuery()}</text>
          <Show when={mode() === "search"}>
            <text fg={colors.overlay0}>_</text>
          </Show>
          <Show when={mode() !== "search" && searchQuery()}>
            <text fg={colors.overlay0}> (Esc to clear)</text>
          </Show>
        </box>
      </Show>

      {/* Delete confirmation */}
      <Show when={mode() === "delete-confirm" && deleteTarget()}>
        <box
          height={1}
          width="100%"
          paddingLeft={1}
          backgroundColor={colors.red}
          flexDirection="row"
        >
          <text fg={colors.base}>Delete "{deleteTarget()?.name}"?   </text>
          <text fg={colors.base}>[y] Remove from list       </text>
          <text fg={colors.base}>[Shift+D] Delete from disk       </text>
          <text fg={colors.base}>[Esc] Cancel</text>
        </box>
      </Show>

      {/* Main content */}
      <box flexGrow={1} width="100%" flexDirection="column">
        <ProjectList
          projects={filteredProjects()}
          selectedIndex={selectedIndex()}
        />
      </box>

      {/* Status bar */}
      <StatusBar message={statusMessage() || error() || undefined} />
    </box>
  )
}
