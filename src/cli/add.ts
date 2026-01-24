import { addProjectsFromDirectory } from "../core";

export function addCommand(path: string | undefined): void {
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
    return;
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
}
