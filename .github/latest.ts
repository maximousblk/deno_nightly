import { parse, Args } from "https://deno.land/std@0.69.0/flags/mod.ts";
import {
  getCommitsBetween,
  getPrNumber,
  getPullRequest,
  PullRequest,
  getLastTag,
  getCommitForTag,
  getInitialCommit,
} from "https://deno.land/x/prlog@0.3.1/mod.ts";

const args: Args = parse(Deno.args);
const headcommit: string = args.h;
const from_tag: string | undefined = await getLastTag("denoland/deno");
const basecommit: string = from_tag
  ? await getCommitForTag("denoland/deno", from_tag)
  : await getInitialCommit("denoland/deno");
const notes: string = await template(basecommit, headcommit);

console.log({ basecommit, headcommit, notes });

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
  base: string,
  head: string,
): Promise<string> {
  if (head && base !== "err") {
    const docs: string =
      `https://doc.deno.land/https/github.com/maximousblk/deno_nightly/releases/download/latest`;
    const diff: string = `${base.substring(0, 7)}...${head.substring(0, 7)}`;
    const changes: string = await changelog(base, head);

    return `<!-- ${head} -->

## Changelog

changes since ${from_tag} release

${changes}

${
      head !== base
        ? `Full diff: [\`${diff}\`](https://github.com/denoland/deno/compare/${diff})`
        : ""
    }

## Runtime Documentation

- [Stable Runtime Documentation](${docs}/lib.deno-nightly.d.ts)
- [Unstable Runtime Documentation](${docs}/lib.deno-nightly.unstable.d.ts)

## Install

**BASH:**

\`\`\`sh
curl -fsSL https://denonightly.now.sh/install.sh | sh
\`\`\`

**POWERSHELL:**

\`\`\`ps1
iwr https://denonightly.now.sh/install.ps1 -useb | iex
\`\`\`

**GitHub Actions:**

\`\`\`yml
- uses: denolib/setup-deno@v2
  with:
    deno-version: nightly
\`\`\`
`;
  } else {
    throw new Error("Invalid template props");
  }
}

if (headcommit) {
  await Deno.writeFile(`latest.md`, new TextEncoder().encode(notes));
} else {
  throw new Error("Invalid Arguments");
}
