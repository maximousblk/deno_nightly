import { parse, Args } from "https://deno.land/std@0.69.0/flags/mod.ts";
const args: Args = parse(Deno.args);
const build: string = args.b;

console.log({ build })

const upgrade = await Deno.readTextFile("cli/tools/upgrade.rs");
await Deno.writeTextFile("cli/tools/upgrade.rs", upgrade.replace(`crate::version::DENO`, `"0.0.1"`));

const data = await Deno.readTextFile("cli/version.rs");
await Deno.writeTextFile("cli/version.rs", data.replace(`env!("CARGO_PKG_VERSION")`, `"nightly ${build}"`));
