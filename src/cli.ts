import { loadProjects, addProjectsFromDirectory, removeProject, findProjectByName } from "./core";

const HELP = `
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

export function runCli(args: string[]): boolean {
  const command = args[0];

  if (!command || command === "" || command.startsWith("-")) {
    if (args.includes("-h") || args.includes("--help")) {
      console.log(HELP);
      return true;
    }
    if (args.includes("-v") || args.includes("--version")) {
      console.log("devhub v0.1.0");
      return true;
    }
    return false;
  }

  switch (command) {
    case "help":
      console.log(HELP);
      return true;

    case "add": {
      const path = args[1];
      if (!path) {
        console.error("Error: Please provide a path");
        console.error("Usage: devhub add <path>");
        process.exit(1);
      }

      const result = addProjectsFromDirectory(path);

      if (result.errors.length > 0) {
        for (const error of result.errors) {
          console.error(`Error: ${error}`);
        }
        process.exit(1);
      }

      if (result.added.length === 0) {
        console.log("No new projects found.");
        if (result.skipped.length > 0) {
          console.log(`Skipped: ${result.skipped.join(", ")}`);
        }
        return true;
      }

      console.log(`Added ${result.added.length} project(s):\n`);
      for (const project of result.added) {
        console.log(`  ${project.name}`);
        console.log(`    Path: ${project.path}`);
        console.log(`    ID: ${project.id}`);
        console.log();
      }

      if (result.skipped.length > 0) {
        console.log(`Skipped: ${result.skipped.join(", ")}`);
      }

      return true;
    }

    case "list": {
      const projects = loadProjects();
      if (projects.length === 0) {
        console.log("No projects added yet.");
        console.log("Add some with: devhub add <path>");
        return true;
      }
      console.log("Projects:\n");
      for (const project of projects) {
        console.log(`  ${project.name}`);
        console.log(`    Path: ${project.path}`);
        console.log(`    ID: ${project.id}`);
        console.log();
      }
      return true;
    }

    case "remove": {
      const idOrName = args[1];
      if (!idOrName) {
        console.error("Error: Please provide a project ID or name");
        console.error("Usage: devhub remove <id|name>");
        process.exit(1);
      }
      try {
        const project = findProjectByName(idOrName);
        if (!project) {
          console.error(`Error: Project not found: ${idOrName}`);
          process.exit(1);
        }
        removeProject(project.id);
        console.log(`Removed project: ${project.name}`);
      } catch (e) {
        console.error(`Error: ${(e as Error).message}`);
        process.exit(1);
      }
      return true;
    }

    default:
      console.error(`Unknown command: ${command}`);
      console.log(HELP);
      process.exit(1);
  }
}
