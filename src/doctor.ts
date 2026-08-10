import { existsSync } from "node:fs";
import { join } from "node:path";
import type { DoctorCheck } from "./types.js";
import { GitManager } from "./git.js";
import { statusIcon } from "./utils.js";

export async function runDoctor(
  rootPath: string,
  git: GitManager,
): Promise<DoctorCheck[]> {
  const checks: DoctorCheck[] = [];
  const repository = await git.isRepository();
  checks.push({
    name: "Git repository",
    status: repository ? "ok" : "fail",
    detail: repository
      ? "Repository detected"
      : "Current directory is not a Git repository",
    fixable: true,
  });
  if (repository) {
    const remote = await git.remote();
    checks.push({
      name: "Remote",
      status: remote ? "ok" : "warn",
      detail: remote ?? "No remote configured",
    });
    const summary = await git.summary();
    checks.push({
      name: "Current branch",
      status: summary.branch ? "ok" : "fail",
      detail: summary.branch || "Detached HEAD",
    });
    checks.push({
      name: "Working tree",
      status: summary.clean ? "ok" : "warn",
      detail: summary.clean
        ? "Clean"
        : `${summary.modified + summary.staged + summary.untracked} pending changes`,
    });
    checks.push({
      name: "Upstream",
      status: summary.tracking ? "ok" : "warn",
      detail: summary.tracking ?? "No upstream configured",
      fixable: false,
    });
    checks.push({
      name: "Branch divergence",
      status: summary.ahead === 0 && summary.behind === 0 ? "ok" : "warn",
      detail: `${summary.ahead} ahead, ${summary.behind} behind`,
    });
    checks.push({
      name: "Stale branches",
      status: "ok",
      detail: "Run `devflow branch cleanup` to review merged local branches",
    });
  }
  checks.push({
    name: "GitHub authentication",
    status: process.env.DEVFLOW_GITHUB_TOKEN ? "ok" : "warn",
    detail: process.env.DEVFLOW_GITHUB_TOKEN
      ? "Token provided through environment"
      : "Optional token not configured",
  });
  checks.push({
    name: "Node",
    status: Number(process.versions.node.split(".")[0]) >= 22 ? "ok" : "warn",
    detail: `Node.js ${process.versions.node}`,
  });
  checks.push({
    name: "README",
    status: existsSync(join(rootPath, "README.md")) ? "ok" : "warn",
    detail: existsSync(join(rootPath, "README.md"))
      ? "README.md present"
      : "README.md missing",
    fixable: true,
  });
  checks.push({
    name: ".gitignore",
    status: existsSync(join(rootPath, ".gitignore")) ? "ok" : "warn",
    detail: existsSync(join(rootPath, ".gitignore"))
      ? ".gitignore present"
      : ".gitignore missing",
    fixable: true,
  });
  checks.push({
    name: "TypeScript configuration",
    status: existsSync(join(rootPath, "tsconfig.json")) ? "ok" : "warn",
    detail: existsSync(join(rootPath, "tsconfig.json"))
      ? "tsconfig.json present"
      : "tsconfig.json not found",
  });
  checks.push({
    name: "Test configuration",
    status:
      existsSync(join(rootPath, "vitest.config.ts")) ||
      existsSync(join(rootPath, "jest.config.js"))
        ? "ok"
        : "warn",
    detail: "Test runner configuration is optional for non-Node repositories",
  });
  checks.push({
    name: "Lint configuration",
    status:
      existsSync(join(rootPath, "eslint.config.js")) ||
      existsSync(join(rootPath, ".eslintrc.json"))
        ? "ok"
        : "warn",
    detail: "Lint configuration is optional for non-Node repositories",
  });
  return checks;
}

export function formatDoctor(checks: DoctorCheck[]): string {
  return checks
    .map(
      (check) =>
        `${statusIcon(check.status)} ${check.name.padEnd(24)} ${check.detail}`,
    )
    .join("\n");
}

export function safeFix(rootPath: string, checks: DoctorCheck[]): string[] {
  const fixed: string[] = [];
  const readme = checks.find((check) => check.name === "README");
  if (readme?.status === "warn" && readme.fixable) {
    const path = join(rootPath, "README.md");
    if (!existsSync(path)) {
      fixed.push(
        "README.md was not created because DevFlow will not invent project documentation.",
      );
    }
  }
  return fixed;
}
