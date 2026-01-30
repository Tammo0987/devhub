import { Match, Show, Switch } from "solid-js";
import { colors } from "../theme";
import { KeyHint } from "./KeyHint";

interface StatusBarProps {
  message?: string;
  mode: "normal" | "browse" | "search";
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
        <Switch>
          <Match when={props.mode === "browse"}>
            <KeyHint keys="Enter" label="Select" />
            <KeyHint keys="l/→" label="Open" />
            <KeyHint keys="h/←" label="Back" />
            <KeyHint keys="Esc" label="Cancel" />
          </Match>
          <Match when={props.mode === "normal" || props.mode === "search"}>
            <KeyHint keys="Enter" label="Open" />
            <KeyHint keys="/" label="Search" />
            <KeyHint keys="b" label="Browse" />
            <KeyHint keys="g" label="Git" />
            <KeyHint keys="c" label="Agent" />
            <KeyHint keys="t" label="Term" />
            <KeyHint keys="r" label="Refresh" />
            <KeyHint keys="q" label="Quit" />
          </Match>
        </Switch>
      </Show>
    </box>
  );
}
