#!/bin/sh

set -e

if [ "$(uname -m)" != "x86_64" ]; then
  echo "Error: Unsupported architecture $(uname -m). Only x64 binaries are available." 1>&2
  exit 1
fi

if ! command -v unzip >/dev/null; then
  echo "Error: unzip is required to install Deno (Nightly) (see: 'https://denonightly.now.sh/#/?id=unzip-is-required')." 1>&2
  exit 1
fi

if [ "$OS" = "Windows_NT" ]; then
  target="x86_64-pc-windows-msvc"
else
  case $(uname -s) in
  Darwin) target="x86_64-apple-darwin" ;;
  *) target="x86_64-unknown-linux-gnu" ;;
  esac
fi

if [ $# -eq 0 ]; then
  deno_asset_path=$(
    curl -sSf https://github.com/maximousblk/deno_nightly/releases |
      grep -o "/maximousblk/deno_nightly/releases/download/.*/deno-nightly-${target}\\.zip" |
      head -n 1
  )
  if [ ! "$deno_asset_path" ]; then
    echo "Error: Unable to find latest Deno (Nightly) release on GitHub." 1>&2
    exit 1
  fi
  deno_uri="https://github.com${deno_asset_path}"
else
  deno_uri="https://github.com/maximousblk/deno_nightly/releases/download/${1}/deno-nightly-${target}.zip"
fi

deno_install="${DENO_INSTALL:-$HOME/.deno}"
bin_dir="$deno_install/bin"
exe="$bin_dir/deno"

if [ ! -d "$bin_dir" ]; then
  mkdir -p "$bin_dir"
fi

curl --fail --location --progress-bar --output "$exe.zip" "$deno_uri"
unzip -d "$bin_dir" -o "$exe.zip"
chmod +x "$exe"
rm "$exe.zip"

echo "Deno (Nightly) was installed successfully to $bin_dir/deno"
if command -v deno >/dev/null; then
  echo "Run 'deno --help' to get started"
else
  case $SHELL in
  /bin/zsh) shell_profile=".zshrc" ;;
  *) shell_profile=".bash_profile" ;;
  esac
  echo "Manually add the directory to your \$HOME/$shell_profile (or similar)"
  echo "  export DENO_INSTALL=\"$deno_install\""
  echo "  export PATH=\"\$DENO_INSTALL/bin:\$PATH\""
  echo "Run '$exe --help' to get started"
fi
