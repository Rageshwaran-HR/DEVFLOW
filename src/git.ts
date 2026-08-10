import {
  simpleGit,
  type SimpleGit,
  type BranchSummary,
  type LogResult,
  type StatusResult,
} from "simple-git";
import { existsSync } from "node:fs";
import type { RepositorySummary } from "./types.js";
import { DevFlowError } from "./utils.js";

export class GitManager {
  private readonly git: SimpleGit;

  constructor(public readonly rootPath: string) {
    this.git = simpleGit(rootPath);
  }

  async isRepository(): Promise<boolean> {
    return (
      existsSync(`${this.rootPath}/.git`) || (await this.git.checkIsRepo())
    );
  }

  async initialize(): Promise<void> {
    await this.git.init();
  }

  async remote(): Promise<string | null> {
    const remotes = await this.git.getRemotes(true);
    return (
      remotes.find((item) => item.name === "origin")?.refs.fetch ??
      remotes[0]?.refs.fetch ??
      null
    );
  }

  async defaultBranch(): Promise<string> {
    try {
      const symbolic = await this.git.raw([
        "symbolic-ref",
        "refs/remotes/origin/HEAD",
      ]);
      return symbolic.trim().split("/").pop() ?? "main";
    } catch {
      const branches = await this.git.branchLocal();
      return branches.all.includes("main")
        ? "main"
        : branches.all.includes("master")
          ? "master"
          : branches.current || "main";
    }
  }

  async currentBranch(): Promise<string> {
    return (await this.git.branchLocal()).current;
  }

  async status(): Promise<StatusResult> {
    return this.git.status();
  }

  async summary(): Promise<RepositorySummary> {
    const status = await this.status();
    const log = await this.git.log({ maxCount: 1000 });
    return {
      branch: status.current ?? "(detached HEAD)",
      clean: status.isClean(),
      staged: status.staged.length,
      modified: status.modified.length,
      untracked: status.not_added.length,
      ahead: status.ahead,
      behind: status.behind,
      commits: log.total,
      tracking: status.tracking,
    };
  }

  async branches(): Promise<BranchSummary> {
    return this.git.branchLocal();
  }

  async createBranch(name: string, checkout = true): Promise<void> {
    if (
      !/^[a-zA-Z0-9._/-]+$/.test(name) ||
      name.startsWith("/") ||
      name.endsWith("/")
    ) {
      throw new DevFlowError(`Invalid branch name: ${name}`);
    }
    const branches = await this.branches();
    if (branches.all.includes(name))
      throw new DevFlowError(
        `Branch already exists: ${name}`,
        "Run `devflow branch list`.",
      );
    await this.git.checkoutLocalBranch(name);
    if (!checkout) await this.git.checkout(branches.current);
  }

  async switchBranch(name: string): Promise<void> {
    try {
      await this.git.checkout(name);
    } catch {
      throw new DevFlowError(
        `Unable to switch to branch: ${name}`,
        "Run `devflow branch list`.",
      );
    }
  }

  async deleteBranch(name: string, force = false): Promise<void> {
    if (name === (await this.currentBranch()))
      throw new DevFlowError("Cannot delete the current branch.");
    await this.git.deleteLocalBranch(name, force);
  }

  async cleanupBranches(defaultBranch: string): Promise<string[]> {
    const branches = await this.branches();
    const candidates = branches.all.filter(
      (name) =>
        name !== defaultBranch &&
        name !== branches.current &&
        !name.startsWith("main") &&
        !name.startsWith("master"),
    );
    const deleted: string[] = [];
    for (const branch of candidates) {
      const summary = await this.git.branch(["--merged", defaultBranch]);
      if (summary.all.includes(branch)) {
        await this.git.deleteLocalBranch(branch);
        deleted.push(branch);
      }
    }
    return deleted;
  }

  async log(maxCount = 20): Promise<LogResult> {
    return this.git.log({ maxCount });
  }

  async diff(staged = false): Promise<string> {
    return staged ? this.git.diff(["--cached"]) : this.git.diff();
  }

  async add(paths: string[] = ["."]): Promise<void> {
    await this.git.add(paths);
  }

  async commit(message: string): Promise<string> {
    const result = await this.git.commit(message);
    return result.commit;
  }

  async push(setUpstream = false): Promise<void> {
    const branch = await this.currentBranch();
    if (setUpstream) await this.git.push(["--set-upstream", "origin", branch]);
    else await this.git.push();
  }

  async pull(): Promise<void> {
    await this.git.pull();
  }
  async fetch(): Promise<void> {
    await this.git.fetch();
  }
  async pushAll(): Promise<{ pushedBranches: string[]; remoteUrl: string | null }> {
    const remote = await this.remote();
    const branches = await this.branches();
    await this.git.push(["--all", "origin"]);
    return {
      pushedBranches: branches.all,
      remoteUrl: remote,
    };
  }

  async merge(branch: string): Promise<void> {
    await this.git.merge([branch]);
  }

  async mergeSafe(
    branch: string,
    noFf = true,
  ): Promise<{ success: boolean; message: string; conflicts?: string[] }> {
    try {
      const args = noFf ? ["--no-ff", branch] : [branch];
      await this.git.merge(args);
      return {
        success: true,
        message: `Successfully merged '${branch}' into '${await this.currentBranch()}'`,
      };
    } catch (err: unknown) {
      const status = await this.status();
      if (status.conflicted.length > 0) {
        return {
          success: false,
          message: `Merge conflict while merging '${branch}'`,
          conflicts: status.conflicted,
        };
      }
      const msg = err instanceof Error ? err.message : String(err);
      return { success: false, message: msg };
    }
  }

  async stashSave(message?: string): Promise<string> {
    const args = message ? ["save", message] : ["save"];
    return this.git.stash(args);
  }

  async stashList(): Promise<Array<{ id: string; message: string }>> {
    const raw = await this.git.stash(["list"]);
    if (!raw.trim()) return [];
    return raw
      .trim()
      .split("\n")
      .map((line) => {
        const match = line.match(/^(stash@\{\d+\}):\s*(.*)$/);
        return match
          ? { id: match[1], message: match[2] }
          : { id: "stash", message: line };
      });
  }

  async stashPop(): Promise<string> {
    return this.git.stash(["pop"]);
  }

  async stashApply(id = "stash@{0}"): Promise<string> {
    return this.git.stash(["apply", id]);
  }

  async stashDrop(id = "stash@{0}"): Promise<string> {
    return this.git.stash(["drop", id]);
  }

  async rebase(branch: string): Promise<void> {
    await this.git.rebase([branch]);
  }

  async changedFiles(
    base: string,
  ): Promise<{ files: string[]; insertions: number; deletions: number }> {
    const raw = await this.git.diff(["--stat", `${base}...HEAD`]);
    const lines = raw.trim().split("\n").filter(Boolean);
    const summary = lines
      .at(-1)
      ?.match(/(\d+) insertions?\(\+\).*?(\d+) deletions?\(-\)/);
    return {
      files: lines
        .slice(0, -1)
        .map((line) => line.trim().split(/\s+\|\s+/)[0])
        .filter(Boolean),
      insertions: summary ? Number(summary[1]) : 0,
      deletions: summary ? Number(summary[2]) : 0,
    };
  }
}
