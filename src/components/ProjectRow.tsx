import type { ProjectWithStatus } from "../core/types";
import { shortenPath } from "../core/paths";
import { colors } from "../theme";

interface ProjectRowProps {
  project: ProjectWithStatus;
  selected: boolean;
}

function relativeTime(isoDate?: string): string {
  if (!isoDate) return "—";

  const date = new Date(isoDate);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHr / 24);

  if (diffSec < 60) return "now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDays < 30) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

export function ProjectRow(props: ProjectRowProps) {
  const git = () => props.project.git;

  const branchDisplay = () => {
    if (!git().isRepo) return "—";
    return git().branch || "unknown";
  };

  const statusIcon = () => {
    if (!git().isRepo) return " ";
    if (git().dirty) return "✗";
    return "✓";
  };

  const statusColor = () => {
    if (!git().isRepo) return colors.overlay0;
    if (git().dirty) return colors.red;
    return colors.green;
  };

  const aheadBehind = () => {
    if (!git().isRepo) return "—";
    const parts: string[] = [];
    const ahead = git().ahead;
    const behind = git().behind;
    if (ahead !== undefined && ahead > 0) parts.push(`↑${ahead}`);
    if (behind !== undefined && behind > 0) parts.push(`↓${behind}`);
    return parts.length > 0 ? parts.join(" ") : "—";
  };

  const bgColor = () => (props.selected ? colors.surface0 : undefined);
  const nameColor = () => (props.selected ? colors.text : colors.subtext1);

  return (
    <box
      height={1}
      width="100%"
      flexDirection="row"
      backgroundColor={bgColor()}
      paddingLeft={1}
      paddingRight={1}
    >
      <text width={2} fg={props.selected ? colors.mauve : undefined}>
        {props.selected ? ">" : " "}
      </text>

      <text width={20} fg={nameColor()}>
        {props.project.name}
      </text>

      <text width={10} fg={colors.lavender}>
        {relativeTime(props.project.lastAccessedAt)}
      </text>

      <text width={14} fg={colors.blue}>
        {branchDisplay()}
      </text>

      <text width={6} fg={statusColor()}>
        {statusIcon()}
      </text>

      <text width={8} fg={colors.peach}>
        {aheadBehind()}
      </text>

      <text flexGrow={1} fg={colors.overlay1}>
        {shortenPath(props.project.path)}
      </text>
    </box>
  );
}
