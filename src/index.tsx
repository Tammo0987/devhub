#!/usr/bin/env bun
import { render } from "@opentui/solid";
import { App } from "./App";
import { runCli } from "./cli";

const args = process.argv.slice(2);
const result = runCli(args);

if (!result.handled && result.rootDir) {
  render(() => <App initialRootDir={result.rootDir!} />);
}
