{
  description = "A TUI project manager with git integration";

  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs =
    {
      self,
      nixpkgs,
      flake-utils,
    }:
    let
      packageJson = builtins.fromJSON (builtins.readFile ./package.json);
      inherit (packageJson) version description;
    in
    flake-utils.lib.eachDefaultSystem (
      system:
      let
        pkgs = nixpkgs.legacyPackages.${system};

        node_modules = pkgs.stdenvNoCC.mkDerivation {
          pname = "devhub-dependencies";
          inherit version;
          src = ./.;

          nativeBuildInputs = [ pkgs.bun ];

          buildPhase = ''
            export HOME=$TMPDIR
            bun install --frozen-lockfile
          '';

          installPhase = ''
            mkdir -p $out
            cp -r node_modules $out/
          '';

          outputHashAlgo = "sha256";
          outputHashMode = "recursive";
          outputHash = "sha256-3BSnjIDvHP1Sl9At52iVHpw17L6BmGAFhUAvEhihK3c=";
        };
      in
      {
        packages.default = pkgs.stdenvNoCC.mkDerivation {
          pname = "devhub";
          inherit version;
          src = ./.;

          nativeBuildInputs = [
            pkgs.bun
            pkgs.makeWrapper
          ];

          buildPhase = ''
            export HOME=$TMPDIR
            cp -r ${node_modules}/node_modules node_modules
            rm -f bunfig.toml
            bun run compile
          '';

          installPhase = ''
            mkdir -p $out/bin $out/lib/devhub/node_modules
            cp -r node_modules/@opentui $out/lib/devhub/node_modules/
            cp dist/devhub $out/lib/devhub/devhub
            makeWrapper $out/lib/devhub/devhub $out/bin/devhub \
              --set NODE_PATH $out/lib/devhub/node_modules
          '';

          meta = with pkgs.lib; {
            inherit description;
            homepage = "https://github.com/Tammo0987/devhub";
            platforms = platforms.unix;
            mainProgram = "devhub";
          };
        };
      }
    );
}
