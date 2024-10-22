## Deno Nightly

🌙 Nightly builds for Deno 🦕

> Deprecated in favour of [Deno Canary](https://deno.land/manual@v1.11.0/contributing/release_schedule#canary-channel)

If you are a module author or have been using Deno for a while you may have noticed updates unexpectedly breaking your applications. I believe this is done to avoid development of a bad standard and inability to fix it in the future.

Whatever the reason may be, your applications break because of these updates and you don't like it. Well, wouldn't it be amazing if you could somehow know about these changes before the update?

You can use these nightly builds to test your applications for future breaking changes. This way you can know what part of your application will break in the next update and prepare a fix before the release.

## Builds

You can find all the builds on the [releases](https://github.com/maximousblk/deno_nightly/releases) page. All builds are tagged by the date they were built. Date format is `YYYY.MM.DD`. There is also a release named `latest` which is updated everyday with the latest build.

## Install

One-line commands to install Deno Nightly builds on your system.

#### Latest Build

**With Bash:**

```sh
curl -fsSL https://denonightly.now.sh/sh | sh
```

**With PowerShell:**

```powershell
iwr https://denonightly.now.sh/ps1 -useb | iex
```

#### Specific Build

**With Bash:**

```sh
curl -fsSL https://denonightly.now.sh/sh | sh -s 2020.06.27
```

**With PowerShell:**

```powershell
$v="2020.06.27"; iwr https://denonightly.now.sh/ps1 -useb | iex
```

### GitHub Actions

You can use Deno Nightly builds to setup an automated test for your applications using [setup-deno](https://github.com/denolib/setup-deno) action.

```yml
steps:
  - uses: actions/checkout@v2
  - uses: denolib/setup-deno@v2
    with:
      deno-version: nightly
  - run: |
      deno --version
      deno run https://deno.land/std/examples/welcome.ts
```

### Environment Variables

##### DENO_INSTALL

The directory in which to install Deno. This defaults to `$HOME/.deno`. The executable is placed in `$DENO_INSTALL/bin`

One application of this is a system-wide installation:

**With Bash:**

```sh
curl -fsSL https://denonightly.now.sh/sh | sudo DENO_INSTALL=/usr/local sh
```

**With PowerShell:**

```powershell
# Run as administrator:
$env:DENO_INSTALL = "C:\Program Files\deno"
iwr https://denonightly.now.sh/ps1 -useb | iex
```

## Compatibility

- The Bash installer can be used on Windows via the [Windows Subsystem for Linux](https://docs.microsoft.com/en-us/windows/wsl/about).

## Known Issues

#### Unzip is required

The program [`unzip`](https://linux.die.net/man/1/unzip) is a requirement for the Bash installer.

```sh
$ curl -fsSL https://denonightly.now.sh/sh | sh
Error: unzip is required to install Deno (see: 'https://denonightly.now.sh/#/?id=unzip-is-required').
```

**When does this issue occur?**

During the installation process, `unzip` is used to extract the zip archive.

**How can this issue be fixed?**

You can install unzip via `brew install unzip` on MacOS or `apt-get install unzip -y` on Linux.

## Disclaimer

**HERE BE DRAGONS**

This is an unofficial repository that provides nightly builds for [Deno](https://deno.land/).

It goes without saying but, **DO NOT** use these binaries in any production environments. They are untested and will probably have bugs.

Any issues related to Deno do not belong here. If there is an issue with the build process used in this repo, be my guest.

## License

Deno is licensed under the [MIT License](https://github.com/denoland/deno/blob/master/LICENSE). The binaries and install scripts provided through this repository are also licensed under the same license
