import { colors } from "../theme";

interface DeleteConfirmProps {
  name: string;
}

export function DeleteConfirm(props: DeleteConfirmProps) {
  return (
    <box height={1} width="100%" paddingLeft={1} backgroundColor={colors.red} flexDirection="row">
      <text fg={colors.base}>Delete "{props.name}"? </text>
      <text fg={colors.base}>[y] Remove from list </text>
      <text fg={colors.base}>[Shift+D] Delete from disk </text>
      <text fg={colors.base}>[Esc] Cancel</text>
    </box>
  );
}
