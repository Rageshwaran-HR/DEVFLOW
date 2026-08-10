import { writeFileSync, existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import type { Project, RepositorySummary, Task } from "./types.js";
import { ensureParent } from "./utils.js";

export function buildReport(
  project: Project,
  tasks: Task[],
  git: RepositorySummary,
): string {
  const completed = tasks.filter(
    (task) => task.status === "COMPLETED" || task.status === "CLOSED",
  );
  const pending = tasks.filter((task) => !completed.includes(task));
  const lines = [
    "# Development Report",
    "",
    `Generated: ${new Date().toISOString()}`,
    "",
    "## Project",
    "",
    `- **Name:** ${project.name}`,
    `- **Repository:** ${project.remoteUrl ?? "Local repository"}`,
    `- **Default branch:** ${project.defaultBranch}`,
    `- **Workflow:** ${project.workflowStrategy}`,
    "",
    "## Tasks",
    "",
    `- Total: ${tasks.length}`,
    `- Completed: ${completed.length}`,
    `- Pending: ${pending.length}`,
    "",
    ...taskTable(tasks),
    "",
    "## Git Activity",
    "",
    `- Current branch: \`${git.branch}\``,
    `- Commits: ${git.commits}`,
    `- Working tree: ${git.clean ? "clean" : "has uncommitted changes"}`,
    `- Ahead / behind: ${git.ahead} / ${git.behind}`,
    "",
    "## Branches",
    "",
    `- Tracking: ${git.tracking ?? "not configured"}`,
    "",
    "## Commits",
    "",
    `The local repository currently contains ${git.commits} commits in the inspected history.`,
    "",
    "## Pull Requests",
    "",
    "GitHub pull request details are available when `DEVFLOW_GITHUB_TOKEN` is configured.",
    "",
    "## Code Reviews",
    "",
    "Review and CI state is fetched live from GitHub and is not copied into the local project database.",
    "",
    "## Completed Work",
    "",
    ...(completed.length
      ? completed.map((task) => `- ${task.id}: ${task.title}`)
      : ["- None"]),
    "",
    "## Pending Work",
    "",
    ...(pending.length
      ? pending.map((task) => `- ${task.id}: ${task.title} (${task.status})`)
      : ["- None"]),
    "",
    "## Repository Health",
    "",
    `- Working tree: ${git.clean ? "healthy" : "requires attention"}`,
    `- Upstream: ${git.tracking ? "configured" : "not configured"}`,
    "",
    "## Statistics",
    "",
    `- Tasks completed: ${completed.length}`,
    `- Commits: ${git.commits}`,
    `- Open local tasks: ${pending.length}`,
    "",
  ];
  return lines.join("\n");
}

function taskTable(tasks: Task[]): string[] {
  if (!tasks.length) return ["No tasks recorded yet."];
  return [
    "| ID | Status | Priority | Title | Branch |",
    "| --- | --- | --- | --- | --- |",
    ...tasks.map(
      (task) =>
        `| ${task.id} | ${task.status} | ${task.priority} | ${task.title.replace(/\|/g, "\\|")} | ${task.branch ? `\`${task.branch}\`` : "—"} |`,
    ),
  ];
}

export function writeReport(path: string, content: string): string {
  const absolute = resolve(path);
  ensureParent(absolute);
  writeFileSync(absolute, content, "utf8");
  return absolute;
}

export function buildReadmeSection(project: Project, tasks: Task[]): string {
  return [
    "## DevFlow project status",
    "",
    `This repository is tracked by **DevFlow** using the **${project.workflowStrategy}** workflow.`,
    "",
    `- Default branch: \`${project.defaultBranch}\``,
    `- Tracked tasks: ${tasks.length}`,
    `- Open tasks: ${tasks.filter((task) => !["COMPLETED", "CLOSED"].includes(task.status)).length}`,
    "",
    "Run `devflow dashboard` for a live local overview.",
    "",
  ].join("\n");
}

export function updateReadme(
  path: string,
  section: string,
): { path: string; created: boolean } {
  const absolute = resolve(path);
  const wasExisting = existsSync(absolute);
  const markerStart = "<!-- devflow:start -->";
  const markerEnd = "<!-- devflow:end -->";
  const block = `${markerStart}\n${section.trim()}\n${markerEnd}`;
  const existing = existsSync(absolute)
    ? readFileSync(absolute, "utf8")
    : `# ${absolute.split("/").at(-2) ?? "Project"}\n\n`;
  const regex = new RegExp(`${markerStart}[\\s\\S]*?${markerEnd}`, "m");
  const content = regex.test(existing)
    ? existing.replace(regex, block)
    : `${existing.trimEnd()}\n\n${block}\n`;
  writeFileSync(absolute, content, "utf8");
  return { path: absolute, created: !wasExisting };
}

export function buildChangelog(
  commits: Array<{ hash: string; message: string; date: string }>,
): string {
  const groups: Record<string, string[]> = {
    Features: [],
    Fixes: [],
    Documentation: [],
    Refactoring: [],
    Tests: [],
    Chores: [],
    Other: [],
  };

  for (const commit of commits) {
    const match = commit.message.match(
      /^(feat|fix|docs|refactor|test|chore)(?:\((.*?)\))?:\s*(.*)$/i,
    );
    const shortHash = commit.hash.slice(0, 7);
    if (match) {
      const type = match[1].toLowerCase();
      const scope = match[2] ? `**${match[2]}**: ` : "";
      const msg = `${scope}${match[3]} (\`${shortHash}\`)`;
      if (type === "feat") groups.Features.push(msg);
      else if (type === "fix") groups.Fixes.push(msg);
      else if (type === "docs") groups.Documentation.push(msg);
      else if (type === "refactor") groups.Refactoring.push(msg);
      else if (type === "test") groups.Tests.push(msg);
      else if (type === "chore") groups.Chores.push(msg);
    } else {
      groups.Other.push(`${commit.message} (\`${shortHash}\`)`);
    }
  }

  const lines = [
    "# Changelog",
    "",
    `Generated on ${new Date().toISOString().split("T")[0]}`,
    "",
  ];
  for (const [title, items] of Object.entries(groups)) {
    if (items.length > 0) {
      lines.push(`## ${title}`, "");
      for (const item of items) {
        lines.push(`- ${item}`);
      }
      lines.push("");
    }
  }
  return lines.join("\n");
}
