import { loadProjects } from "../core";

export function listCommand(): void {
  const projects = loadProjects();

  if (projects.length === 0) {
    console.log("No projects added yet.");
    console.log("Add some with: devhub add <path>");
    return;
  }

  console.log("Projects:\n");
  for (const project of projects) {
    console.log(`  ${project.name}`);
    console.log(`    Path: ${project.path}`);
    console.log(`    ID: ${project.id}`);
    console.log();
  }
}
