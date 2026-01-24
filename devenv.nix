{ pkgs, ... }:

{
  packages = [
    pkgs.bun
    pkgs.zig
    pkgs.lazygit
  ];

  languages.typescript.enable = true;

  enterShell = ''
    echo "🚀 Project Hub dev environment"
    echo ""
    echo "Commands:"
    echo "  bun install    - Install dependencies"
    echo "  bun dev        - Run in development mode"
    echo "  bun run build  - Build single binary"
    echo ""
  '';
}
