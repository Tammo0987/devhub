import { For, Show } from "solid-js";
import type { ProjectWithStatus } from "../core/types";
import { ProjectRow } from "./ProjectRow";
import { colors } from "../theme";
import { useScrollableList } from "../hooks";

interface ProjectListProps {
  projects: ProjectWithStatus[];
  selectedIndex: number;
  searchBarVisible?: boolean;
}

// Fixed heights: header(1) + status(1) + column header(1) + margins(3) = 6
// Add 1 more when search bar is visible
const BASE_FIXED_HEIGHTS = 6;

export function ProjectList(props: ProjectListProps) {
  const { visibleItems, scrollOffset } = useScrollableList({
    items: () => props.projects,
    selectedIndex: () => props.selectedIndex,
    fixedHeights: () => BASE_FIXED_HEIGHTS + (props.searchBarVisible ? 1 : 0),
  });

  return (
    <box flexDirection="column" width="100%" flexGrow={1} marginTop={1}>
      <box
        height={1}
        width="100%"
        flexDirection="row"
        paddingLeft={1}
        paddingRight={1}
        backgroundColor={colors.surface0}
      >
        <text width={2} fg={colors.overlay0}>
          {" "}
        </text>
        <text width={20} fg={colors.overlay1}>
          Name
        </text>
        <text width={10} fg={colors.overlay1}>
          Accessed
        </text>
        <text width={14} fg={colors.overlay1}>
          Branch
        </text>
        <text width={6} fg={colors.overlay1}>
          State
        </text>
        <text width={8} fg={colors.overlay1}>
          Remote
        </text>
        <text flexGrow={1} fg={colors.overlay1}>
          Path
        </text>
      </box>

      <Show
        when={props.projects.length > 0}
        fallback={
          <box padding={2}>
            <text fg={colors.overlay1}>No projects yet. Press [a] to add one.</text>
          </box>
        }
      >
        <For each={visibleItems()}>
          {(project, index) => (
            <ProjectRow
              project={project}
              selected={index() + scrollOffset() === props.selectedIndex}
            />
          )}
        </For>
      </Show>
    </box>
  );
}
