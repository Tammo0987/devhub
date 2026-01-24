#!/usr/bin/env bun
import { render } from "@opentui/solid";
import { App } from "./App";
import { runCli } from "./cli";

const args = process.argv.slice(2);

if (!runCli(args)) {
  render(() => <App />);
}
