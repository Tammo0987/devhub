import { Show } from "solid-js";
import { colors } from "../theme";

interface HeaderProps {
  loading?: boolean;
  projectCount: number;
}

export function Header(props: HeaderProps) {
  return (
    <box
      width="100%"
      height={3}
      backgroundColor={colors.mantle}
      flexDirection="column"
      paddingLeft={2}
      paddingTop={1}
    >
      {/* Title */}
      <box flexDirection="row" height={1}>
        <text fg={colors.lavender}>Project Hub</text>
        <text fg={colors.overlay0}> • </text>
        <text fg={colors.overlay1}>
          {props.projectCount} project{props.projectCount !== 1 ? "s" : ""}
        </text>
        <Show when={props.loading}>
          <text fg={colors.overlay0}> (loading...)</text>
        </Show>
      </box>
    </box>
  );
}
