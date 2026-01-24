import { Show } from "solid-js"
import { colors } from "../theme"

interface StatusBarProps {
  message?: string
}

export function StatusBar(props: StatusBarProps) {
  return (
    <box
      height={1}
      width="100%"
      backgroundColor={colors.mantle}
      paddingLeft={1}
      paddingRight={1}
      flexDirection="row"
    >
      <Show when={props.message}>
        <text fg={colors.yellow}>{props.message}</text>
      </Show>
      <Show when={!props.message}>
        <text fg={colors.mauve}>[Enter]</text>
        <text fg={colors.overlay1}> Open  </text>
        <text fg={colors.mauve}>[/]</text>
        <text fg={colors.overlay1}> Search  </text>
        <text fg={colors.mauve}>[a]</text>
        <text fg={colors.overlay1}> Add  </text>
        <text fg={colors.mauve}>[d]</text>
        <text fg={colors.overlay1}> Delete  </text>
        <text fg={colors.mauve}>[g]</text>
        <text fg={colors.overlay1}> Git  </text>
        <text fg={colors.mauve}>[r]</text>
        <text fg={colors.overlay1}> Refresh  </text>
        <text fg={colors.mauve}>[q]</text>
        <text fg={colors.overlay1}> Quit</text>
      </Show>
    </box>
  )
}
