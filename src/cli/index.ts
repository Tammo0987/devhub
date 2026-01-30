import { HELP, VERSION } from "./constants";
import { resolveRootDir } from "../core/config";

export interface CliResult {
  handled: boolean;
  rootDir?: string;
}

export function runCli(args: string[]): CliResult {
  const command = args[0];

  if (args.includes("-h") || args.includes("--help")) {
    console.log(HELP);
    return { handled: true };
  }

  if (args.includes("-v") || args.includes("--version")) {
    console.log(`devhub v${VERSION}`);
    return { handled: true };
  }

  if (!command || command === "") {
    return { handled: false, rootDir: resolveRootDir() };
  }

  switch (command) {
    case "help":
      console.log(HELP);
      return { handled: true };

    default:
      if (!command.startsWith("-")) {
        return { handled: false, rootDir: resolveRootDir(command) };
      }
      console.error(`Unknown option: ${command}`);
      console.log(HELP);
      process.exit(1);
  }
}
