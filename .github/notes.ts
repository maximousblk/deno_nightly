import { parse } from "https://deno.land/std@0.87.0/flags/mod.ts";
import { format } from "https://deno.land/std@0.87.0/datetime/mod.ts";
import { getChangeLog } from "https://deno.land/x/ghlog@0.3.1/mod.ts";
import { getNewestTag } from "https://deno.land/x/ghlog@0.3.1/src/utils.ts";

const args = parse(Deno.args);

const latest = args.latest;
const tag = latest ? "latest" : args.tags ?? Deno.env.get("BUILD_TAG");
const base = latest
  ? await getNewestTag("denoland", "deno")
  : await getBaseCommit();
const head = args.head ?? Deno.env.get("HEAD_COMMIT");
const diff = `${base?.substring(0, 7)}...${head?.substring(0, 7)}`;

console.log({ tag, latest, base, head, diff });

const { changes } = await getChangeLog(
  "denoland/deno",
  base,
  head,
  {
    categories: [
      { name: "BREAKING", emoji: "", title: "" },
      { name: "feat", emoji: "", title: "" },
      { name: "fix", emoji: "", title: "" },
      { name: "upgrade", emoji: "", title: "" },
    ],
    contributors: {
      exclude: ["@web-flow", "@ghost"],
      includeBots: false,
    },
  },
);

const commits = changes
  .map(({ commits }) => {
    return commits
      .map(({ header }) => `- ${header}`)
      .join("\n");
  })
  .join("\n");

const docs = `maximousblk/deno_nightly/releases/download/` + tag;

const changelog = `### CHANGELOG

${commits}

**diff:** [\`${diff}\`](https://github.com/denoland/deno/compare/${diff})

### Runtime Docs

- [Stable](https://doc.deno.land/https/github.com/${docs}/lib.deno-nightly.d.ts)
- [Unstable](https://doc.deno.land/https/github.com/${docs}/lib.deno-nightly.unstable.d.ts)

### INSTALL / UPGRADE

**With Shell:**

\`\`\`sh
curl -fsSL https://denonightly.now.sh/sh | sh${latest ? "" : ` -s ${tag}`}
\`\`\`

**With PowerShell:**

\`\`\`ps1
${latest ? "" : `$v="${tag}"; `}iwr https://denonightly.now.sh/ps1 -useb | iex
\`\`\`
${
  latest ? "" : `
**On GitHub Actions:**

\`\`\`yml
- uses: denolib/setup-deno@v2
with:
deno-version: nightly
\`\`\`
`
}`;

Deno.writeTextFile(tag + ".md", changelog);

async function getBaseCommit(): Promise<string> {
  const sha1 = /\b[0-9a-f]{40}\b/g;
  const release = (
    await fetch(
      "https://api.github.com/repos/maximousblk/deno_nightly/releases/latest",
      {
        headers: {
          Authorization: `token ${Deno.env.get("GITHUB_TOKEN")}`,
        },
      },
    )
  ).json();

  const hash = sha1.exec((await release).body);

  if (hash) {
    return hash[0];
  } else {
    throw new Error("Error while fetching last commit");
  }
}
