import { colors } from "../theme";

interface KeyHintProps {
  keys: string;
  label: string;
}

export function KeyHint(props: KeyHintProps) {
  return (
    <>
      <text fg={colors.mauve}>[{props.keys}]</text>
      <text fg={colors.overlay1}> {props.label} </text>
    </>
  );
}
