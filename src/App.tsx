import { createSignal, Show } from "solid-js";
import { useKeyboard, useRenderer } from "@opentui/solid";
import { ProjectList, StatusBar, Header, FileExplorer, SearchBar } from "./components";
import { useProjects, useFileExplorer, useSearch } from "./hooks";
import { openInEditor, openLazygit, openCodingAgent } from "./core/editor";
import { getCodingAgent } from "./core/paths";
import { colors } from "./theme";

type Mode = "normal" | "browse" | "search";

interface AppProps {
  initialRootDir: string;
}

export function App(props: AppProps) {
  const [rootDir, setRootDir] = createSignal(props.initialRootDir);
  const projects = useProjects(rootDir);
  const explorer = useFileExplorer();
  const search = useSearch(projects.projects);
  const renderer = useRenderer();

  const [mode, setMode] = createSignal<Mode>("normal");
  const [selectedIndex, setSelectedIndex] = createSignal(0);
  const [statusMessage, setStatusMessage] = createSignal<string | undefined>();

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
      projects.updateLastAccessed(project.name);
      exitApp();
    },

    lazygit() {
      const project = selectedProject();
      if (!project) return;
      if (!project.git.isRepo) {
        showMessage("Not a git repository");
        return;
      }

      projects.updateLastAccessed(project.name);
      renderer.suspend();
      openLazygit(project.path);
      renderer.resume();
      projects.refresh();
    },

    codingAgent() {
      const project = selectedProject();
      if (!project) return;

      if (!getCodingAgent()) {
        showMessage("Set $DEVHUB_AGENT to your coding agent command");
        return;
      }

      projects.updateLastAccessed(project.name);
      renderer.suspend();
      openCodingAgent(project.path);
      renderer.resume();
      projects.refresh();
    },

    startBrowse() {
      explorer.reset(rootDir());
      setMode("browse");
    },

    submitBrowse() {
      const path = explorer.getSelectedPath();
      if (!path) return;
      setRootDir(path);
      showMessage(`Root: ${path}`);
      setMode("normal");
      resetSelection();
    },

    cancelBrowse() {
      explorer.reset();
      setMode("normal");
    },
  };

  useKeyboard((key) => {
    if (key.ctrl && key.name === "c") {
      exitApp();
    }

    if (mode() === "browse") {
      switch (key.name) {
        case "escape":
          actions.cancelBrowse();
          break;
        case "return":
          actions.submitBrowse();
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
      case "b":
        actions.startBrowse();
        break;
      case "g":
        actions.lazygit();
        break;
      case "c":
        actions.codingAgent();
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

      <Show when={mode() === "browse"}>
        <FileExplorer
          currentPath={explorer.path()}
          entries={explorer.entries()}
          selectedIndex={explorer.selectedIndex()}
        />
      </Show>

      <Show when={mode() === "search" || search.query()}>
        <SearchBar query={search.query()} isActive={mode() === "search"} />
      </Show>

      <box flexGrow={1} width="100%" flexDirection="column">
        <ProjectList projects={search.filtered()} selectedIndex={selectedIndex()} />
      </box>

      <StatusBar message={statusMessage() || projects.error() || undefined} />
    </box>
  );
}
