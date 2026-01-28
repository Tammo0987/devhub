import packageJson from "../../package.json";

export const HELP = `
devhub - A TUI project manager

Usage:
  devhub              Open interactive TUI
  devhub add <path>   Add all projects inside a directory
  devhub list         List all projects
  devhub remove <id>  Remove a project by ID or name
  devhub help         Show this help message

Options:
  -h, --help     Show help
  -v, --version  Show version

Examples:
  devhub add ~/projects    Add all project directories inside ~/projects
  devhub add .             Add all projects in current directory
`;

export const VERSION = packageJson.version;
