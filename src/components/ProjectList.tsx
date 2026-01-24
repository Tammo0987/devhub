import { For, Show } from "solid-js"
import type { ProjectWithStatus } from "../core/types"
import { ProjectRow } from "./ProjectRow"
import { colors } from "../theme"

interface ProjectListProps {
  projects: ProjectWithStatus[]
  selectedIndex: number
}

export function ProjectList(props: ProjectListProps) {
  return (
    <box flexDirection="column" width="100%" flexGrow={1} marginTop={1}>
      {/* Column headers */}
      <box
        height={1}
        width="100%"
        flexDirection="row"
        paddingLeft={1}
        paddingRight={1}
        backgroundColor={colors.surface0}
      >
        <text width={2} fg={colors.overlay0}> </text>
        <text width={20} fg={colors.overlay1}>Name</text>
        <text width={10} fg={colors.overlay1}>Accessed</text>
        <text width={14} fg={colors.overlay1}>Branch</text>
        <text width={6} fg={colors.overlay1}>State</text>
        <text width={8} fg={colors.overlay1}>Remote</text>
        <text flexGrow={1} fg={colors.overlay1}>Path</text>
      </box>

      <Show
        when={props.projects.length > 0}
        fallback={
          <box padding={2}>
            <text fg={colors.overlay1}>
              No projects yet. Press [a] to add one or run: devhub add {"<path>"}
            </text>
          </box>
        }
      >
        <For each={props.projects}>
          {(project, index) => (
            <ProjectRow
              project={project}
              selected={index() === props.selectedIndex}
            />
          )}
        </For>
      </Show>
    </box>
  )
}
