import { describe, expect, it } from "vitest";
import { buildReadmeSection, buildReport } from "../src/markdown.js";
import type { Project, RepositorySummary, Task } from "../src/types.js";

const project: Project = {
  id: "project",
  name: "demo",
  rootPath: "/tmp/demo",
  remoteUrl: "https://github.com/acme/demo",
  owner: "acme",
  repository: "demo",
  defaultBranch: "main",
  workflowStrategy: "trunk",
  createdAt: "2026-01-01T00:00:00.000Z",
};

const task: Task = {
  id: "TASK-001",
  title: "Ship report",
  description: "",
  status: "COMPLETED",
  priority: "HIGH",
  labels: [],
  assignee: null,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
  completedAt: "2026-01-02T00:00:00.000Z",
  branch: "feature/TASK-001-ship-report",
  issueNumber: null,
  pullRequestNumber: null,
};

const git: RepositorySummary = {
  branch: "main",
  clean: true,
  staged: 0,
  modified: 0,
  untracked: 0,
  ahead: 0,
  behind: 0,
  commits: 4,
  tracking: "origin/main",
};

describe("Markdown output", () => {
  it("includes project, task, and Git sections", () => {
    const report = buildReport(project, [task], git);
    expect(report).toContain("# Development Report");
    expect(report).toContain("TASK-001");
    expect(report).toContain("feature/TASK-001-ship-report");
    expect(report).toContain("## Repository Health");
  });

  it("creates a safe README section", () => {
    const section = buildReadmeSection(project, [task]);
    expect(section).toContain("## DevFlow project status");
    expect(section).toContain("Tracked tasks: 1");
  });
});
