import { For, Show } from "solid-js";
import { colors } from "../theme";

export interface DirEntry {
  name: string;
  isDirectory: boolean;
}

interface FileExplorerProps {
  currentPath: string;
  entries: DirEntry[];
  selectedIndex: number;
}

export function FileExplorer(props: FileExplorerProps) {
  return (
    <box flexDirection="column" width="100%" height="100%">
      {/* Current path header */}
      <box
        height={1}
        width="100%"
        paddingLeft={1}
        backgroundColor={colors.surface0}
        flexDirection="row"
      >
        <text fg={colors.green}>+ </text>
        <text fg={colors.text}>{props.currentPath}</text>
      </box>

      {/* Help bar */}
      <box
        height={1}
        width="100%"
        paddingLeft={1}
        backgroundColor={colors.mantle}
        flexDirection="row"
      >
        <text fg={colors.mauve}>[Enter]</text>
        <text fg={colors.overlay0}> Add </text>
        <text fg={colors.mauve}>[Shift+Enter]</text>
        <text fg={colors.overlay0}> Add all </text>
        <text fg={colors.mauve}>[l/→]</text>
        <text fg={colors.overlay0}> Open </text>
        <text fg={colors.mauve}>[h/←]</text>
        <text fg={colors.overlay0}> Back </text>
        <text fg={colors.mauve}>[Esc]</text>
        <text fg={colors.overlay0}> Cancel</text>
      </box>

      {/* Directory listing */}
      <box flexDirection="column" width="100%" flexGrow={1}>
        <Show when={props.entries.length === 0}>
          <box paddingLeft={1}>
            <text fg={colors.overlay0}>Empty directory</text>
          </box>
        </Show>
        <For each={props.entries}>
          {(entry, index) => {
            const isSelected = () => index() === props.selectedIndex;
            return (
              <box
                height={1}
                width="100%"
                paddingLeft={1}
                backgroundColor={isSelected() ? colors.surface0 : undefined}
                flexDirection="row"
              >
                <text width={2} fg={isSelected() ? colors.mauve : undefined}>
                  {isSelected() ? ">" : " "}
                </text>
                <text fg={entry.isDirectory ? colors.blue : colors.text}>
                  {entry.isDirectory ? `${entry.name}/` : entry.name}
                </text>
              </box>
            );
          }}
        </For>
      </box>
    </box>
  );
}
