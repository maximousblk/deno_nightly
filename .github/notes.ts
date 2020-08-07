// DEPS
import { parse } from "https://deno.land/std@0.63.0/flags/mod.ts";

// PROPS
const headcommit: string = parse(Deno.args).h;
const basecommit: string = await getLastCommit();
const token: string = parse(Deno.args).t;
const build: string = parse(Deno.args).b;
const notes: string = template(build, basecommit, headcommit);

// DEBUG
console.log("v:", build);
console.log("b:", basecommit);
console.log("h:", headcommit);
console.log("n:", notes);

// FUNCTIONS
async function getLastCommit(): Promise<string> {
  const sha1: RegExp = /\b[0-9a-f]{5,40}\b/g;
  const release = (
    await fetch(
      "https://api.github.com/repos/maximousblk/deno_nightly/releases/latest",
      {
        headers: {
          Authorization: `token ${token}`,
        },
      }
    )
  ).json();

  const hash: RegExpExecArray | null = sha1.exec((await release).body);

  if (hash) {
    return hash[0];
  } else {
    throw new Error("Error while fetching last commit");
  }
}

// TEMPLATE
function template(tag: string, base: string, head: string): string {
  if (tag && head && base !== "err") {
    const sh: string = "curl -fsSL https://denonightly.now.sh/install.sh | sh";
    const ps: string = "iwr https://denonightly.now.sh/install.ps1 -useb | iex";
    const diff: string = `${base.substring(0, 7)}...${head.substring(0, 7)}`;

    return `<!-- ${head} -->

## Changelog

Full changelog: [\`${diff}\`](https://github.com/denoland/deno/compare/${diff})

## Runtime Documentation

- [Stable Runtime Documentation](https://doc.deno.land/https/github.com/maximousblk/deno_nightly/releases/download/${tag}/lib.deno-nightly.d.ts)
- [Unstable Runtime Documentation](https://doc.deno.land/https/github.com/maximousblk/deno_nightly/releases/download/${tag}/lib.deno-nightly.unstable.d.ts)

## Install

**With Shell:**

\`\`\`sh
${tag === "latest" ? sh : `${sh} -s ${tag}`}
\`\`\`

**With PowerShell:**

\`\`\`powershell
${tag === "latest" ? ps : `$v="${tag}"; ${ps}`}
\`\`\`

**GtiHub Actions:**

\`\`\`yml
- uses: denolib/setup-deno@v2.1.0
  with:
    deno-version: nightly
\`\`\`
`;
  } else {
    throw new Error("Invalid template props");
  }
}

// MAIN
if (build && headcommit) {
  await Deno.writeFile(`${build}.md`, new TextEncoder().encode(notes));
} else {
  throw new Error("Invalid Arguments");
}
