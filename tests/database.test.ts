import { describe, expect, it } from "vitest";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { Database } from "../src/database.js";

function database(): Database {
  const root = mkdtempSync(join(tmpdir(), "devflow-db-"));
  return new Database(join(root, ".devflow", "devflow.db"), true);
}

describe("task persistence", () => {
  it("generates stable task IDs and moves tasks through their lifecycle", () => {
    const db = database();
    const task = db.addTask({
      title: "Implement authentication",
      description: "Add secure login",
      priority: "HIGH",
      labels: ["auth"],
      assignee: "dev",
    });
    expect(task.id).toBe("TASK-001");
    expect(db.getTask(task.id).status).toBe("TODO");
    expect(
      db.updateTask(task.id, {
        status: "IN_PROGRESS",
        branch: "feature/TASK-001-authentication",
      }).status,
    ).toBe("IN_PROGRESS");
    const completed = db.updateTask(task.id, { status: "COMPLETED" });
    expect(completed.completedAt).toBeTruthy();
    expect(db.getTask(task.id).status).toBe("COMPLETED");
    db.close();
  });

  it("supports linking issues and pull requests", () => {
    const db = database();
    const task = db.addTask({
      title: "Ship report",
      description: "",
      priority: "MEDIUM",
      labels: [],
      assignee: null,
    });
    expect(
      db.updateTask(task.id, { issueNumber: 42, pullRequestNumber: 7 }),
    ).toMatchObject({
      issueNumber: 42,
      pullRequestNumber: 7,
    });
    db.close();
  });

  it("does not reuse a deleted task ID", () => {
    const db = database();
    const first = db.addTask({
      title: "First",
      description: "",
      priority: "LOW",
      labels: [],
      assignee: null,
    });
    db.deleteTask(first.id);
    const second = db.addTask({
      title: "Second",
      description: "",
      priority: "LOW",
      labels: [],
      assignee: null,
    });
    expect(second.id).toBe("TASK-002");
    db.close();
  });
});
