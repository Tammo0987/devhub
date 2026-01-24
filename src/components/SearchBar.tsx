import { Show } from "solid-js";
import { colors } from "../theme";

interface SearchBarProps {
  query: string;
  isActive: boolean;
}

export function SearchBar(props: SearchBarProps) {
  return (
    <box
      height={1}
      width="100%"
      paddingLeft={1}
      backgroundColor={colors.surface0}
      flexDirection="row"
    >
      <text fg={colors.mauve}>/</text>
      <text fg={colors.text}>{props.query}</text>
      <Show when={props.isActive}>
        <text fg={colors.overlay0}>_</text>
      </Show>
      <Show when={!props.isActive && props.query}>
        <text fg={colors.overlay0}> (Esc to clear)</text>
      </Show>
    </box>
  );
}
