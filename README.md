# DevHub

A terminal UI project manager with git integration, built with Bun, SolidJS, and [@opentui/solid](https://github.com/anomalyco/opentui).

![DevHub TUI](https://img.shields.io/badge/TUI-Catppuccin%20Mocha-b4befe)

## Features

- **Project List** - View all your projects sorted by last accessed time
- **Git Status** - See branch, working tree state (clean/dirty), and remote sync status
- **Quick Search** - Filter projects by name or path
- **File Explorer** - Browse directories to add new projects
- **Editor Integration** - Open projects in your `$EDITOR`
- **Lazygit Integration** - Quick access to git operations

## Installation

### From Source

```bash
# Clone and build
git clone <repo-url>
cd project-hub
bun install
bun run build

# Copy binary to PATH
sudo cp dist/devhub /usr/local/bin/
```

### Development

```bash
bun install
bun dev
```

## Usage

### TUI Mode

```bash
devhub
```

### CLI Commands

```bash
devhub add <path>    # Add all git repos inside a directory
devhub list          # List all projects
devhub remove <id>   # Remove a project by ID or name
devhub help          # Show help
```

## Keybindings

| Key                    | Action                             |
| ---------------------- | ---------------------------------- |
| `j` / `k` or `↑` / `↓` | Navigate list                      |
| `Enter`                | Open project in `$EDITOR`          |
| `/`                    | Search/filter projects             |
| `a`                    | Add projects (opens file explorer) |
| `d`                    | Delete project                     |
| `g`                    | Open lazygit                       |
| `r`                    | Refresh git status                 |
| `q`                    | Quit                               |

### File Explorer (Add Mode)

| Key                    | Action                 |
| ---------------------- | ---------------------- |
| `j` / `k` or `↑` / `↓` | Navigate               |
| `l` / `→`              | Enter directory        |
| `h` / `←`              | Go to parent           |
| `Enter`                | Add current directory  |
| `Shift+Enter`          | Add all subdirectories |
| `Esc`                  | Cancel                 |

### Delete Confirmation

| Key       | Action                 |
| --------- | ---------------------- |
| `y`       | Remove from list only  |
| `Shift+D` | Delete files from disk |
| `Esc`     | Cancel                 |

## Configuration

Projects are stored at `~/.config/devhub/projects.json`.

The editor is determined by `$EDITOR` environment variable.

## Tech Stack

- **Runtime**: [Bun](https://bun.sh)
- **Language**: TypeScript
- **TUI Framework**: [@opentui/solid](https://github.com/anomalyco/opentui)
- **UI Library**: [SolidJS](https://solidjs.com)
- **Git**: [simple-git](https://github.com/steveukx/git-js)
- **Theme**: [Catppuccin Mocha](https://github.com/catppuccin/catppuccin)
