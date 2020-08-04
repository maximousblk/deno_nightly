import { parse } from "https://deno.land/std@0.63.0/flags/mod.ts";

const version: string = parse(Deno.args).v;
const commit2: string = parse(Deno.args).c;
const commit1: string = await getLastCommit();
const notes: string = template(version, commit2);

console.log("\nv:", version);
console.log("\n1:", commit1);
console.log("\n2:", commit2);
console.log("\nn:", notes);

if (version && commit2) {
  await Deno.writeFile(`${version}.md`, new TextEncoder().encode(notes));
} else {
  throw new Error("Invalid Arguments");
}

async function getLastCommit(): Promise<string> {
  const sha1: RegExp = /\b[0-9a-f]{5,40}\b/g;
  const api = await fetch(
    "https://api.github.com/repos/maximousblk/deno_nightly_area_51/releases/latest",
  );

  const hash: RegExpExecArray | null = sha1.exec((await api.json()).body);

  if (hash) {
    return hash[0];
  } else {
    throw new Error("previous commit unavailable");
  }
}

function template(version: string, commit2: string): string {
  if (version && commit2 && commit1 !== "err") {
    const sh: string = "https://denonightly.now.sh/install.sh";
    const ps: string = "https://denonightly.now.sh/install.ps1";
    const diff: string = `${commit1.substring(0, 7)}...${commit2.substring(0, 7)}`;

    return `<!-- ${commit2} -->

**Changelog:** [\`${diff}\`](https://github.com/denoland/deno/compare/${diff})

[Deno Nightly runtime documentation](https://doc.deno.land/https/github.com/maximousblk/deno_nightly/releases/download/${version}/lib.deno-nightly.d.ts)

#### Install

**With Shell:**

\`\`\`sh
curl -fsSL ${sh}${version === "latest" ? "" : ` | sh -s ${version}`}
\`\`\`

**With PowerShell:**

\`\`\`powershell
${version === "latest" ? "" : `$v="${version}"; `}iwr ${ps} -useb | iex
\`\`\`
`;
  } else {
    console.log({});

    throw new Error("Could not use template");
  }
}
