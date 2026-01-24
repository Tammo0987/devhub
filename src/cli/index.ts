import { HELP, VERSION } from "./constants";
import { addCommand } from "./add";
import { listCommand } from "./list";
import { removeCommand } from "./remove";

export function runCli(args: string[]): boolean {
  const command = args[0];

  if (!command || command === "" || command.startsWith("-")) {
    if (args.includes("-h") || args.includes("--help")) {
      console.log(HELP);
      return true;
    }
    if (args.includes("-v") || args.includes("--version")) {
      console.log(`devhub v${VERSION}`);
      return true;
    }
    return false;
  }

  switch (command) {
    case "help":
      console.log(HELP);
      return true;

    case "add":
      addCommand(args[1]);
      return true;

    case "list":
      listCommand();
      return true;

    case "remove":
      removeCommand(args[1]);
      return true;

    default:
      console.error(`Unknown command: ${command}`);
      console.log(HELP);
      process.exit(1);
  }
}
