#!/usr/bin/env pwsh

$ErrorActionPreference = 'Stop'

if ($v) {
  $Version = "${v}"
}
if ($args.Length -eq 1) {
  $Version = $args.Get(0)
}

$DenoInstall = $env:DENO_INSTALL
$BinDir = if ($DenoInstall) {
  "$DenoInstall\bin"
} else {
  "$Home\.deno\bin"
}

$DenoZip = "$BinDir\deno.zip"
$DenoExe = "$BinDir\deno.exe"
$Target = 'x86_64-pc-windows-msvc'

# GitHub requires TLS 1.2
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

$DenoUri = if (!$Version) {
  $Response = Invoke-WebRequest 'https://github.com/maximousblk/deno_nightly/releases' -UseBasicParsing
  if ($PSVersionTable.PSEdition -eq 'Core') {
    $Response.Links |
    Where-Object { $_.href -like "/maximousblk/deno_nightly/releases/download/*/deno-nightly-${Target}.zip" } |
    ForEach-Object { 'https://github.com' + $_.href } |
    Select-Object -First 1
  } else {
    $HTMLFile = New-Object -Com HTMLFile
    if ($HTMLFile.IHTMLDocument2_write) {
      $HTMLFile.IHTMLDocument2_write($Response.Content)
    } else {
      $ResponseBytes = [Text.Encoding]::Unicode.GetBytes($Response.Content)
      $HTMLFile.write($ResponseBytes)
    }
    $HTMLFile.getElementsByTagName('a') |
    Where-Object { $_.href -like "about:/maximousblk/deno_nightly/releases/download/*/deno-nightly-${Target}.zip" } |
    ForEach-Object { $_.href -replace 'about:', 'https://github.com' } |
    Select-Object -First 1
  }
} else {
  "https://github.com/maximousblk/deno_nightly/releases/download/${Version}/deno-nightly-${Target}.zip"
}

if (!(Test-Path $BinDir)) {
  New-Item $BinDir -ItemType Directory | Out-Null
}

Invoke-WebRequest $DenoUri -OutFile $DenoZip -UseBasicParsing

if (Get-Command Expand-Archive -ErrorAction SilentlyContinue) {
  Expand-Archive $DenoZip -Destination $BinDir -Force
} else {
  if (Test-Path $DenoExe) {
    Remove-Item $DenoExe
  }
  Add-Type -AssemblyName System.IO.Compression.FileSystem
  [IO.Compression.ZipFile]::ExtractToDirectory($DenoZip, $BinDir)
}

Remove-Item $DenoZip

$User = [EnvironmentVariableTarget]::User
$Path = [Environment]::GetEnvironmentVariable('Path', $User)
if (!(";$Path;".ToLower() -like "*;$BinDir;*".ToLower())) {
  [Environment]::SetEnvironmentVariable('Path', "$Path;$BinDir", $User)
  $Env:Path += ";$BinDir"
}

Write-Output "Deno (Nightly) was installed successfully to $DenoExe"
Write-Output "Run 'deno --help' to get started"
