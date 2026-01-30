import { useKeyboard, useRenderer } from "@opentui/solid";
import type { Accessor, Setter } from "solid-js";
import type { ProjectWithStatus } from "../core/types";
import { openInEditor, openLazygit, openCodingAgent } from "../core/editor";
import { getCodingAgent } from "../core/paths";

type Mode = "normal" | "browse" | "search";

interface KeyboardHandlerOptions {
  mode: Accessor<Mode>;
  setMode: Setter<Mode>;
  selectedIndex: Accessor<number>;
  setSelectedIndex: Setter<number>;
  rootDir: Accessor<string>;
  setRootDir: Setter<string>;
  showMessage: (msg: string) => void;
  projects: {
    projects: Accessor<ProjectWithStatus[]>;
    refresh: () => void;
    updateLastAccessed: (name: string) => void;
  };
  explorer: {
    reset: (path?: string) => void;
    moveUp: () => void;
    moveDown: () => void;
    navigateUp: () => void;
    navigateInto: () => void;
    getSelectedPath: () => string | null;
  };
  search: {
    query: Accessor<string>;
    filtered: Accessor<ProjectWithStatus[]>;
    start: () => void;
    clear: () => void;
    backspace: () => void;
    appendChar: (char: string) => void;
  };
}

export function useKeyboardHandler(options: KeyboardHandlerOptions) {
  const {
    mode,
    setMode,
    selectedIndex,
    setSelectedIndex,
    rootDir,
    setRootDir,
    showMessage,
    projects,
    explorer,
    search,
  } = options;

  const renderer = useRenderer();

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
}
