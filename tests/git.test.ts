import { describe, expect, it } from "vitest";
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { simpleGit } from "simple-git";
import { GitManager } from "../src/git.js";

describe("GitManager", () => {
  it("initializes a repository, commits, branches, and reads status", async () => {
    const root = mkdtempSync(join(tmpdir(), "devflow-git-"));
    mkdirSync(join(root, ".git"), { recursive: true });
    const rawGit = simpleGit(root);
    await rawGit.init();
    await rawGit.addConfig("user.email", "devflow@example.com");
    await rawGit.addConfig("user.name", "DevFlow Test");
    writeFileSync(join(root, "README.md"), "# Test\n", "utf8");
    await rawGit.add("README.md");
    await rawGit.commit("chore: initialize test repository");

    const git = new GitManager(root);
    expect(await git.isRepository()).toBe(true);
    expect((await git.summary()).clean).toBe(true);
    await git.createBranch("feature/TASK-001-test");
    expect(await git.currentBranch()).toBe("feature/TASK-001-test");
    expect((await git.branches()).all).toContain("feature/TASK-001-test");
  });
});
