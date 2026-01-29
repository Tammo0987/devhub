import { createSignal, Show } from "solid-js";
import { useKeyboard, useRenderer } from "@opentui/solid";
import {
  ProjectList,
  StatusBar,
  Header,
  FileExplorer,
  SearchBar,
  DeleteConfirm,
} from "./components";
import { useProjects, useFileExplorer, useSearch } from "./hooks";
import { openInEditor, openLazygit } from "./core/editor";
import { deleteDirectory } from "./core/filesystem";
import { colors } from "./theme";

type Mode = "normal" | "add" | "search" | "delete-confirm";

export function App() {
  const projects = useProjects();
  const explorer = useFileExplorer();
  const search = useSearch(projects.projects);
  const renderer = useRenderer();

  const [mode, setMode] = createSignal<Mode>("normal");
  const [selectedIndex, setSelectedIndex] = createSignal(0);
  const [statusMessage, setStatusMessage] = createSignal<string | undefined>();
  const [deleteTarget, setDeleteTarget] = createSignal<{
    id: string;
    name: string;
    path: string;
  } | null>(null);

  function showMessage(msg: string, duration = 2000) {
    setStatusMessage(msg);
    setTimeout(() => setStatusMessage(undefined), duration);
  }

  function selectedProject() {
    const list = search.filtered();
    return list[selectedIndex()] || null;
  }

  function exitApp() {
    renderer.destroy();
    process.exit(0);
  }

  function resetSelection() {
    setSelectedIndex(0);
  }

  const actions = {
    open() {
      const project = selectedProject();
      if (!project) return;

      if (!openInEditor(project.path)) {
        showMessage("Set $EDITOR to open projects");
        return;
      }
      projects.updateLastAccessed(project.id);
      exitApp();
    },

    lazygit() {
      const project = selectedProject();
      if (!project) return;
      if (!project.git.isRepo) {
        showMessage("Not a git repository");
        return;
      }

      projects.updateLastAccessed(project.id);
      renderer.suspend();
      openLazygit(project.path);
      renderer.resume();
      projects.refresh();
    },

    startDelete() {
      const project = selectedProject();
      if (!project) return;
      setDeleteTarget({ id: project.id, name: project.name, path: project.path });
      setMode("delete-confirm");
    },

    confirmDelete(alsoDeleteFiles: boolean) {
      const target = deleteTarget();
      if (!target) return;

      if (alsoDeleteFiles && !deleteDirectory(target.path)) {
        showMessage(`Failed to delete files: ${target.path}`);
      }

      if (projects.removeProject(target.id)) {
        showMessage(alsoDeleteFiles ? `Deleted: ${target.name}` : `Removed: ${target.name}`);
        if (selectedIndex() >= search.filtered().length) {
          setSelectedIndex(Math.max(0, search.filtered().length - 1));
        }
      }
      setDeleteTarget(null);
      setMode("normal");
    },

    cancelDelete() {
      setDeleteTarget(null);
      setMode("normal");
    },

    submitAdd() {
      const path = explorer.getSelectedPath();
      if (!path) {
        showMessage("No directory selected");
        return;
      }

      if (projects.addProject(path)) {
        showMessage(`Added project: ${path}`);
        setSelectedIndex(projects.projects().length - 1);
      } else {
        showMessage(projects.error() || "Failed to add project");
        projects.clearError();
      }
      explorer.reset();
      setMode("normal");
    },

    submitAddAll() {
      const path = explorer.getSelectedPath();
      if (!path) {
        showMessage("No directory selected");
        return;
      }

      const result = projects.addAllSubdirs(path);
      if (result.added > 0) {
        const suffix = result.skipped > 0 ? `, ${result.skipped} skipped` : "";
        showMessage(`Added ${result.added} project${result.added !== 1 ? "s" : ""}${suffix}`);
      } else if (result.skipped > 0) {
        showMessage(`All ${result.skipped} projects already exist`);
      } else {
        showMessage("No subdirectories found");
      }
      explorer.reset();
      setMode("normal");
    },

    cancelAdd() {
      explorer.reset();
      setMode("normal");
    },
  };

  useKeyboard((key) => {
    if (key.ctrl && key.name === "c") {
      exitApp();
    }

    if (mode() === "add") {
      switch (key.name) {
        case "escape":
          actions.cancelAdd();
          break;
        case "return":
          if (key.shift) {
            actions.submitAddAll();
          } else {
            actions.submitAdd();
          }
          break;
        case "up":
        case "k":
          explorer.moveUp();
          break;
        case "down":
        case "j":
          explorer.moveDown();
          break;
        case "backspace":
        case "h":
        case "left":
          explorer.navigateUp();
          break;
        case "l":
        case "right":
          explorer.navigateInto();
          break;
      }
      return;
    }

    if (mode() === "delete-confirm") {
      switch (key.name) {
        case "escape":
        case "n":
          actions.cancelDelete();
          break;
        case "y":
          actions.confirmDelete(false);
          break;
        case "d":
          if (key.shift) actions.confirmDelete(true);
          break;
      }
      return;
    }

    if (mode() === "search") {
      switch (key.name) {
        case "escape":
          search.clear();
          resetSelection();
          setMode("normal");
          break;
        case "return":
          setMode("normal");
          break;
        case "backspace":
          search.backspace();
          resetSelection();
          break;
        default:
          if (key.sequence?.length === 1 && !key.ctrl && !key.meta) {
            search.appendChar(key.sequence);
            resetSelection();
          }
      }
      return;
    }

    switch (key.name) {
      case "escape":
        if (search.query()) {
          search.clear();
          resetSelection();
        }
        break;
      case "up":
      case "k":
        setSelectedIndex((i) => Math.max(0, i - 1));
        break;
      case "down":
      case "j":
        setSelectedIndex((i) => Math.min(search.filtered().length - 1, i + 1));
        break;
      case "return":
        actions.open();
        break;
      case "a":
        setMode("add");
        break;
      case "d":
        actions.startDelete();
        break;
      case "g":
        actions.lazygit();
        break;
      case "r":
        projects.refresh();
        break;
      case "q":
        exitApp();
        break;
    }

    if (key.sequence === "/") {
      search.start();
      resetSelection();
      setMode("search");
    }
  });

  return (
    <box width="100%" height="100%" flexDirection="column" backgroundColor={colors.base}>
      <Header loading={projects.loading()} projectCount={search.filtered().length} />

      <Show when={mode() === "add"}>
        <FileExplorer
          currentPath={explorer.path()}
          entries={explorer.entries()}
          selectedIndex={explorer.selectedIndex()}
        />
      </Show>

      <Show when={mode() === "search" || search.query()}>
        <SearchBar query={search.query()} isActive={mode() === "search"} />
      </Show>

      <Show when={mode() === "delete-confirm" && deleteTarget()}>
        <DeleteConfirm name={deleteTarget()!.name} />
      </Show>

      <box flexGrow={1} width="100%" flexDirection="column">
        <ProjectList projects={search.filtered()} selectedIndex={selectedIndex()} />
      </box>

      <StatusBar message={statusMessage() || projects.error() || undefined} />
    </box>
  );
}
