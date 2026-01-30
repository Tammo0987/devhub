import { createSignal, Show } from "solid-js";
import { ProjectList, StatusBar, Header, FileExplorer, SearchBar } from "./components";
import { useProjects, useFileExplorer, useSearch, useKeyboardHandler } from "./hooks";
import { colors } from "./theme";

type Mode = "normal" | "browse" | "search";

interface AppProps {
  initialRootDir: string;
}

export function App(props: AppProps) {
  const [rootDir, setRootDir] = createSignal(props.initialRootDir);
  const [mode, setMode] = createSignal<Mode>("normal");
  const [selectedIndex, setSelectedIndex] = createSignal(0);
  const [statusMessage, setStatusMessage] = createSignal<string | undefined>();

  const projects = useProjects(rootDir);
  const explorer = useFileExplorer();
  const search = useSearch(projects.projects);

  function showMessage(msg: string, duration = 2000) {
    setStatusMessage(msg);
    setTimeout(() => setStatusMessage(undefined), duration);
  }

  useKeyboardHandler({
    mode,
    setMode,
    selectedIndex,
    setSelectedIndex,
    rootDir,
    setRootDir,
    showMessage,
    projects: {
      projects: projects.projects,
      refresh: projects.refresh,
      updateLastAccessed: projects.updateLastAccessed,
    },
    explorer: {
      reset: explorer.reset,
      moveUp: explorer.moveUp,
      moveDown: explorer.moveDown,
      navigateUp: explorer.navigateUp,
      navigateInto: explorer.navigateInto,
      getSelectedPath: explorer.getSelectedPath,
    },
    search: {
      query: search.query,
      filtered: search.filtered,
      start: search.start,
      clear: search.clear,
      backspace: search.backspace,
      appendChar: search.appendChar,
    },
  });

  return (
    <box width="100%" height="100%" flexDirection="column" backgroundColor={colors.base}>
      <Header loading={projects.loading()} projectCount={search.filtered().length} />

      <Show
        when={mode() !== "browse"}
        fallback={
          <FileExplorer
            currentPath={explorer.path()}
            entries={explorer.entries()}
            selectedIndex={explorer.selectedIndex()}
          />
        }
      >
        <Show when={mode() === "search" || search.query()}>
          <SearchBar query={search.query()} isActive={mode() === "search"} />
        </Show>

        <box flexGrow={1} width="100%" flexDirection="column">
          <ProjectList
            projects={search.filtered()}
            selectedIndex={selectedIndex()}
            searchBarVisible={mode() === "search" || !!search.query()}
          />
        </box>
      </Show>

      <StatusBar mode={mode()} message={statusMessage() || projects.error() || undefined} />
    </box>
  );
}
