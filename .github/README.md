## Deno Nightly

🌙 Nightly builds for Deno 🦕

###### HERE BE DRAGONS

This is an unofficial repository that provides nightly builds for [Deno](https://deno.land/).

It goes without saying but, **DO NOT** use these binaries in any production environments. They are untested and will most probably have bugs.

Any issues related to Deno do not belong here. If there is an issue with the build process used in this repo, be my guest.

Nothing in this repository is guaranteed to work. Any loss or harm caused due to these binaries is not my responsibility.

> If nothing is guaranteed to work, then who in there right mind would use these builds?

nerds.

## Builds

You can find all the builds on the [releases](https://github.com/maximousblk/deno_nightly/releases) page. All builds are tagged by the date they were built. Date format is `YYYY.MM.DD`. There is also a release named `latest` which is updated everyday with the latest build.

## Install

One-line commands to install Deno Nightly builds on your system.

#### Latest Build

**With Shell:**

```sh
curl -fsSL https://denonightly.now.sh/install.sh | sh
```

**With PowerShell:**

```powershell
iwr https://denonightly.now.sh/install.ps1 -useb | iex
```

#### Specific Build

**With Shell:**

```sh
curl -fsSL https://denonightly.now.sh/install.sh | sh -s 2020.06.27
```

**With PowerShell:**

```powershell
$v="2020.06.27"; iwr https://denonightly.now.sh/install.ps1 -useb | iex
```


### Environment Variables

##### DENO_INSTALL

The directory in which to install Deno. This defaults to `$HOME/.deno`. The executable is placed in `$DENO_INSTALL/bin`.

One application of this is a system-wide installation:

**With Shell (`/usr/local`):**

```sh
curl -fsSL https://denonightly.now.sh/install.sh | sudo DENO_INSTALL=/usr/local sh
```

**With PowerShell (`C:\Program Files\deno`):**

```powershell
# Run as administrator:
$env:DENO_INSTALL = "C:\Program Files\deno"
iwr https://denonightly.now.sh/install.ps1 -useb | iex
```

## Compatibility

- The Shell installer can be used on Windows via the [Windows Subsystem for Linux](https://docs.microsoft.com/en-us/windows/wsl/about).

## Known Issues

#### unzip is required

The program [`unzip`](https://linux.die.net/man/1/unzip) is a requirement for the Shell installer.

```sh
$ curl -fsSL https://denonightly.now.sh/install.sh | sh
Error: unzip is required to install Deno (see: https://github.com/maximousblk/deno_nightly#unzip-is-required).
```

**When does this issue occur?**

During the `install.sh` process, `unzip` is used to extract the zip archive.

**How can this issue be fixed?**

You can install unzip via `brew install unzip` on MacOS or `apt-get install unzip -y` on Linux.

## License

Deno is licensed under the [MIT License](https://github.com/denoland/deno/blob/master/LICENSE). The binaries and install scripts provided through this repository are also licensed under the same license
