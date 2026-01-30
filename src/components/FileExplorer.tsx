import { For, Show } from "solid-js";
import { colors } from "../theme";
import { useScrollableList } from "../hooks";

export interface DirEntry {
  name: string;
  isDirectory: boolean;
}

interface FileExplorerProps {
  currentPath: string;
  entries: DirEntry[];
  selectedIndex: number;
}

// Fixed heights: header(1) + status(1) + path bar(1) + margins(2) = 5
const FIXED_HEIGHTS = 5;

export function FileExplorer(props: FileExplorerProps) {
  const { visibleItems, scrollOffset } = useScrollableList({
    items: () => props.entries,
    selectedIndex: () => props.selectedIndex,
    fixedHeights: () => FIXED_HEIGHTS,
  });

  return (
    <box flexDirection="column" width="100%" height="100%">
      <box
        height={1}
        width="100%"
        paddingLeft={1}
        backgroundColor={colors.surface0}
        flexDirection="row"
      >
        <text fg={colors.overlay0}>Current: </text>
        <text fg={colors.text}>{props.currentPath}</text>
      </box>

      <box flexDirection="column" width="100%" flexGrow={1}>
        <Show when={props.entries.length === 0}>
          <box paddingLeft={1}>
            <text fg={colors.overlay0}>Empty directory</text>
          </box>
        </Show>
        <For each={visibleItems()}>
          {(entry, index) => {
            const isSelected = () => index() + scrollOffset() === props.selectedIndex;
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
