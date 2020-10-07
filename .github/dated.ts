import { parse, Args } from "https://deno.land/std@0.69.0/flags/mod.ts";
import {
  getCommitsBetween,
  getPrNumber,
  getPullRequest,
  PullRequest,
} from "https://deno.land/x/prlog@0.3.1/mod.ts";

const args: Args = parse(Deno.args);
const token: string = args.t ?? Deno.env.get("GITHUB_TOKEN")
const build: string = args.b;
const headcommit: string = args.h;
const basecommit: string = await getBaseCommit();
const notes: string = await template(build, basecommit, headcommit);

console.log({ build, basecommit, headcommit, notes });

async function getBaseCommit(): Promise<string> {
  const sha1: RegExp = /\b[0-9a-f]{5,40}\b/g;
  const release = (
    await fetch(
      "https://api.github.com/repos/maximousblk/deno_nightly/releases/latest",
      {
        headers: {
          Authorization: `token ${token}`,
        },
      },
    )
  ).json();

  const hash: RegExpExecArray | null = sha1.exec((await release).body);

  if (hash) {
    return hash[0];
  } else {
    throw new Error("Error while fetching last commit");
  }
}

async function changelog(
  from: string,
  to: string,
): Promise<string> {
  if (from === to) return "No changes";

  const commits_between: { sha: string; message: string }[] =
    await getCommitsBetween("denoland/deno", from, to);

  const changes: PullRequest[] = [];

  for (const commit of commits_between) {
    const pr_number = getPrNumber(commit.message);

    if (pr_number) {
      const pull = await getPullRequest("denoland/deno", pr_number);
      changes.push(pull);
    }
  }

  changes.sort((a, b) => a.number - b.number);

  let lines: string[] = [];
  for (const change of changes) {
    const number: string =
      `[\`#${change.number}\`](https:/github.com/denoland/deno/pull/${change.number})`;

    lines.push(`- ${number} ${change.title}`);
  }
  return lines.join("\n");
}

async function template(
  tag: string,
  base: string,
  head: string,
): Promise<string> {
  if (tag && head && base !== "err") {
    const docs: string =
      `https://doc.deno.land/https/github.com/maximousblk/deno_nightly/releases/download/${tag}`;
    const diff: string = `${base.substring(0, 7)}...${head.substring(0, 7)}`;
    const changes: string = await changelog(base, head);

    return `<!-- ${head} -->

## Changelog

${changes}

${head !== base
        ? `Full diff: [\`${diff}\`](https://github.com/denoland/deno/compare/${diff})`
        : ""
      }

## Runtime Documentation

- [Stable Runtime Documentation](${docs}/lib.deno-nightly.d.ts)
- [Unstable Runtime Documentation](${docs}/lib.deno-nightly.unstable.d.ts)

## Install

**BASH:**

\`\`\`sh
curl -fsSL https://denonightly.now.sh/install.sh | sh -s ${tag}
\`\`\`

**POWERSHELL:**

\`\`\`ps1
$v="${tag}"; iwr https://denonightly.now.sh/install.ps1 -useb | iex
\`\`\`

**GitHub Actions:**

\`\`\`yml
- uses: denolib/setup-deno@v2
  with:
    deno-version: nightly
\`\`\`
`;
  } else {
    const msg: string = `Invalid template props: ${JSON.stringify({ tag, base, head })}`
    throw new Error(msg);
  }
}

if (build && headcommit) {
  await Deno.writeFile(`${build}.md`, new TextEncoder().encode(notes));
} else {
  throw new Error("Invalid Arguments");
}
