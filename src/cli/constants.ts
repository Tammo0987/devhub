import packageJson from "../../package.json";

export const HELP = `
devhub - A TUI project manager

Usage:
  devhub [path]    Open TUI with projects from path (default: current dir)
  devhub help      Show this help message

Options:
  -h, --help     Show help
  -v, --version  Show version

Examples:
  devhub               Open TUI with projects from current directory
  devhub ~/projects    Open TUI with projects from ~/projects
`;

export const VERSION = packageJson.version;
