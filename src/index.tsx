#!/usr/bin/env bun
import { render } from "@opentui/solid";
import { App } from "./App";
import { runCli } from "./cli";

// Parse command line args (skip first two: bun and script path)
const args = process.argv.slice(2);

// Try CLI commands first
const handled = runCli(args);

// If CLI didn't handle it, run the TUI
if (!handled) {
  render(() => <App />);
}
