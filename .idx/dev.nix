{ pkgs, ... }: {
  channel = "stable-24.05";

  packages = [
    pkgs.nodejs_22
    pkgs.jdk17
    pkgs.watchman
  ];

  android = {
    enable = true;
    platforms = [ "34" "36" ];
    buildToolsVersions = [ "34.0.0" "35.0.0" ];
    ndkVersions = [ "26.3.11579264" ];
    abiFilters = [ "arm64-v8a" "x86_64" ];
    systemImageTypes = [ "google_apis" ];
    includeEmulator = false;
  };

  idx = {
    extensions = [
      "msjsdiag.vscode-react-native"
      "dbaeumer.vscode-eslint"
      "esbenp.prettier-vscode"
    ];

    workspace = {
      onCreate = {
        install-deps = "npm install";
      };
    };

    previews = {
      enable = false;
    };
  };
}
