import { removeProject, findProjectByName } from "../core";

export function removeCommand(idOrName: string | undefined): void {
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
}
