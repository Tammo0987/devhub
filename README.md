# DevHub

A terminal UI project manager with git integration, built with Bun, SolidJS, and [@opentui/solid](https://github.com/anomalyco/opentui).

## Features

- **Project List** - View all your projects sorted by last accessed time
- **Git Status** - See branch, working tree state (clean/dirty), and remote sync status
- **Quick Search** - Filter projects by name or path
- **File Explorer** - Browse directories to add new projects
- **Editor Integration** - Open projects in your `$EDITOR`
- **Lazygit Integration** - Quick access to git operations
- **Coding Agent Integration** - Launch AI coding agents (Claude Code, Codex, etc.) in project directories
- **Terminal Integration** - Spawn a shell directly in any project directory

![DevHub TUI](assets/devhub.png)

## Installation

### From Source

```bash
git clone <repo-url>
cd devhub
bun install
bun compile

sudo cp dist/devhub /usr/local/bin/
```

### Development

```bash
bun install
bun dev
```

### Using Nix Flake

```bash
nix run github:Tammo0987/devhub   # try it
nix shell github:Tammo0987/devhub # or add to shell
```

Add to your flake inputs:

```nix
inputs.devhub.url = "github:Tammo0987/devhub";
```

Then add `devhub.packages.${pkgs.system}.default` to `environment.systemPackages` (NixOS) or `home.packages` (Home Manager).

### Using devenv

This project includes a [devenv](https://devenv.sh) configuration that sets up all required dependencies.

With direnv:

```bash
direnv allow
```

Without direnv:

```bash
devenv shell
```

## Usage

### TUI Mode

```bash
devhub
```

### CLI Commands

```bash
devhub [path]        # Open TUI with projects from path (default: current dir)
devhub help          # Show help
devhub -v            # Show version
```

## Keybindings

| Key                    | Action                              |
| ---------------------- | ----------------------------------- |
| `j` / `k` or `↑` / `↓` | Navigate list                       |
| `Enter`                | Open project in `$EDITOR`           |
| `/`                    | Search/filter projects              |
| `b`                    | Browse (opens file explorer)        |
| `g`                    | Open lazygit                        |
| `c`                    | Open coding agent (`$DEVHUB_AGENT`) |
| `t`                    | Open terminal (`$SHELL`)            |
| `r`                    | Refresh git status                  |
| `q`                    | Quit                                |

### File Explorer (Browse Mode)

| Key                    | Action              |
| ---------------------- | ------------------- |
| `j` / `k` or `↑` / `↓` | Navigate            |
| `l` / `→`              | Enter directory     |
| `h` / `←`              | Go to parent        |
| `Enter`                | Select as root      |
| `Esc`                  | Cancel              |

## Configuration

Project metadata is stored at `<rootDir>/.devhub/config.json`.

### Environment Variables

| Variable       | Description                                             |
| -------------- | ------------------------------------------------------- |
| `DEVHUB_ROOT`  | Default root directory for projects                     |
| `EDITOR`       | Editor to open projects with (required for `Enter` key) |
| `DEVHUB_AGENT` | Coding agent command (e.g., `claude` or `codex`)        |
| `SHELL`        | Shell for terminal spawning (defaults to `/bin/sh`)     |

## Tech Stack

- **Runtime**: [Bun](https://bun.sh)
- **Language**: TypeScript
- **TUI Framework**: [@opentui/solid](https://github.com/anomalyco/opentui)
- **UI Library**: [SolidJS](https://solidjs.com)
- **Git**: [simple-git](https://github.com/steveukx/git-js)
- **Theme**: [Catppuccin Mocha](https://github.com/catppuccin/catppuccin)
