import { createRequire } from "node:module";
import { existsSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";
import type { Config, Project, Task, TaskStatus, Priority } from "./types.js";
import { DevFlowError, now } from "./utils.js";

type Row = Record<string, string | number | null>;

interface SQLiteDb {
  exec(sql: string): void;
  prepare(sql: string): {
    run(...args: unknown[]): unknown;
    get(...args: unknown[]): unknown;
    all(...args: unknown[]): unknown[];
  };
  close(): void;
}

function createSqliteDb(path: string): SQLiteDb {
  try {
    const req = createRequire(import.meta.url);
    const { DatabaseSync } = req("node:sqlite");
    return new DatabaseSync(path);
  } catch {
    const req = createRequire(import.meta.url);
    const BetterSqlite3 = req("better-sqlite3");
    return new BetterSqlite3(path);
  }
}

export class Database {
  private readonly db: SQLiteDb;

  constructor(
    public readonly path: string,
    create = false,
  ) {
    if (!create && !existsSync(path)) {
      throw new DevFlowError(
        "DevFlow is not initialized in this directory.",
        "Run `devflow init` first.",
      );
    }
    mkdirSync(dirname(path), { recursive: true });
    this.db = createSqliteDb(path);
    this.db.exec("PRAGMA foreign_keys = ON;");
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS projects (
        id TEXT PRIMARY KEY, name TEXT NOT NULL, root_path TEXT NOT NULL UNIQUE,
        remote_url TEXT, owner TEXT, repository TEXT, default_branch TEXT NOT NULL,
        workflow_strategy TEXT NOT NULL, created_at TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS tasks (
        id TEXT PRIMARY KEY, title TEXT NOT NULL, description TEXT NOT NULL DEFAULT '',
        status TEXT NOT NULL, priority TEXT NOT NULL, labels TEXT NOT NULL DEFAULT '[]',
        assignee TEXT, created_at TEXT NOT NULL, updated_at TEXT NOT NULL,
        completed_at TEXT, branch TEXT, issue_number INTEGER, pull_request_number INTEGER
      );
      CREATE TABLE IF NOT EXISTS branches (
        name TEXT PRIMARY KEY, task_id TEXT REFERENCES tasks(id) ON DELETE SET NULL,
        created_at TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS issues (
        number INTEGER PRIMARY KEY, title TEXT NOT NULL, state TEXT NOT NULL,
        url TEXT, task_id TEXT REFERENCES tasks(id) ON DELETE SET NULL,
        updated_at TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS pull_requests (
        number INTEGER PRIMARY KEY, title TEXT NOT NULL, state TEXT NOT NULL,
        head TEXT NOT NULL, base TEXT NOT NULL, url TEXT,
        task_id TEXT REFERENCES tasks(id) ON DELETE SET NULL, updated_at TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS commits (
        hash TEXT PRIMARY KEY, subject TEXT NOT NULL, author TEXT,
        committed_at TEXT NOT NULL, task_id TEXT REFERENCES tasks(id) ON DELETE SET NULL
      );
      CREATE TABLE IF NOT EXISTS configuration (
        key TEXT PRIMARY KEY, value TEXT NOT NULL, updated_at TEXT NOT NULL
      );
    `);
  }

  close(): void {
    this.db.close();
  }

  saveProject(project: Project): void {
    this.db
      .prepare(
        `
        INSERT INTO projects (id,name,root_path,remote_url,owner,repository,default_branch,workflow_strategy,created_at)
        VALUES (?,?,?,?,?,?,?,?,?)
        ON CONFLICT(root_path) DO UPDATE SET
          name=excluded.name, remote_url=excluded.remote_url, owner=excluded.owner,
          repository=excluded.repository, default_branch=excluded.default_branch,
          workflow_strategy=excluded.workflow_strategy
      `,
      )
      .run(
        project.id,
        project.name,
        project.rootPath,
        project.remoteUrl,
        project.owner,
        project.repository,
        project.defaultBranch,
        project.workflowStrategy,
        project.createdAt,
      );
  }

  getProject(): Project | null {
    const row = this.db
      .prepare("SELECT * FROM projects ORDER BY created_at LIMIT 1")
      .get() as Row | undefined;
    return row ? this.projectFromRow(row) : null;
  }

  saveConfig(config: Config): void {
    const statement = this.db.prepare(
      "INSERT INTO configuration (key,value,updated_at) VALUES (?,?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value,updated_at=excluded.updated_at",
    );
    for (const [key, value] of Object.entries(config))
      statement.run(key, String(value), now());
  }

  addTask(input: {
    title: string;
    description: string;
    priority: Priority;
    labels: string[];
    assignee: string | null;
  }): Task {
    const counterRow = this.db
      .prepare("SELECT value FROM configuration WHERE key='task_counter'")
      .get() as Row | undefined;
    const currentCounter = counterRow ? Number(counterRow.value) : 0;
    const maxExistingRow = this.db
      .prepare(
        "SELECT MAX(CAST(SUBSTR(id, 6) AS INTEGER)) AS max_id FROM tasks",
      )
      .get() as Row | undefined;
    const maxExisting = Number(maxExistingRow?.max_id ?? 0);
    const nextIdNum = Math.max(currentCounter, maxExisting) + 1;

    this.db
      .prepare(
        "INSERT INTO configuration (key,value,updated_at) VALUES ('task_counter',?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value,updated_at=excluded.updated_at",
      )
      .run(String(nextIdNum), now());

    const task: Task = {
      id: `TASK-${String(nextIdNum).padStart(3, "0")}`,
      title: input.title,
      description: input.description,
      status: "TODO",
      priority: input.priority,
      labels: input.labels,
      assignee: input.assignee,
      createdAt: now(),
      updatedAt: now(),
      completedAt: null,
      branch: null,
      issueNumber: null,
      pullRequestNumber: null,
    };
    this.db
      .prepare(
        `
        INSERT INTO tasks (id,title,description,status,priority,labels,assignee,created_at,updated_at,completed_at,branch,issue_number,pull_request_number)
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)
      `,
      )
      .run(
        task.id,
        task.title,
        task.description,
        task.status,
        task.priority,
        JSON.stringify(task.labels),
        task.assignee,
        task.createdAt,
        task.updatedAt,
        task.completedAt,
        task.branch,
        task.issueNumber,
        task.pullRequestNumber,
      );
    return task;
  }

  listTasks(status?: TaskStatus): Task[] {
    const rows = (
      status
        ? this.db
            .prepare(
              "SELECT * FROM tasks WHERE status=? ORDER BY created_at DESC",
            )
            .all(status)
        : this.db.prepare("SELECT * FROM tasks ORDER BY created_at DESC").all()
    ) as Row[];
    return rows.map((row) => this.taskFromRow(row));
  }

  getTask(id: string): Task {
    const row = this.db.prepare("SELECT * FROM tasks WHERE id=?").get(id) as
      Row | undefined;
    if (!row)
      throw new DevFlowError(
        `Task not found: ${id}`,
        "Run `devflow task list` to see available tasks.",
      );
    return this.taskFromRow(row);
  }

  updateTask(
    id: string,
    updates: Partial<
      Pick<Task, "status" | "branch" | "issueNumber" | "pullRequestNumber">
    >,
  ): Task {
    const current = this.getTask(id);
    const next = { ...current, ...updates, updatedAt: now() };
    const completedAt =
      next.status === "COMPLETED" ? (next.completedAt ?? now()) : null;
    this.db
      .prepare(
        `
        UPDATE tasks SET status=?,updated_at=?,completed_at=?,branch=?,issue_number=?,pull_request_number=? WHERE id=?
      `,
      )
      .run(
        next.status,
        next.updatedAt,
        completedAt,
        next.branch,
        next.issueNumber,
        next.pullRequestNumber,
        id,
      );
    return { ...next, completedAt };
  }

  deleteTask(id: string): void {
    this.getTask(id);
    this.db.prepare("DELETE FROM tasks WHERE id=?").run(id);
  }

  saveBranch(name: string, taskId: string | null): void {
    this.db
      .prepare(
        "INSERT OR REPLACE INTO branches (name,task_id,created_at) VALUES (?,?,?)",
      )
      .run(name, taskId, now());
  }

  saveIssue(
    number: number,
    title: string,
    state: string,
    url: string | null,
    taskId: string | null,
  ): void {
    this.db
      .prepare(
        "INSERT OR REPLACE INTO issues (number,title,state,url,task_id,updated_at) VALUES (?,?,?,?,?,?)",
      )
      .run(number, title, state, url, taskId, now());
  }

  savePullRequest(
    number: number,
    title: string,
    state: string,
    head: string,
    base: string,
    url: string | null,
    taskId: string | null,
  ): void {
    this.db
      .prepare(
        "INSERT OR REPLACE INTO pull_requests (number,title,state,head,base,url,task_id,updated_at) VALUES (?,?,?,?,?,?,?,?)",
      )
      .run(number, title, state, head, base, url, taskId, now());
  }

  tasksWithRelations(): Task[] {
    return this.listTasks();
  }

  private projectFromRow(row: Row): Project {
    return {
      id: String(row.id),
      name: String(row.name),
      rootPath: String(row.root_path),
      remoteUrl: row.remote_url ? String(row.remote_url) : null,
      owner: row.owner ? String(row.owner) : null,
      repository: row.repository ? String(row.repository) : null,
      defaultBranch: String(row.default_branch),
      workflowStrategy: String(
        row.workflow_strategy,
      ) as Project["workflowStrategy"],
      createdAt: String(row.created_at),
    };
  }

  private taskFromRow(row: Row): Task {
    return {
      id: String(row.id),
      title: String(row.title),
      description: String(row.description),
      status: String(row.status) as TaskStatus,
      priority: String(row.priority) as Priority,
      labels: JSON.parse(String(row.labels)) as string[],
      assignee: row.assignee ? String(row.assignee) : null,
      createdAt: String(row.created_at),
      updatedAt: String(row.updated_at),
      completedAt: row.completed_at ? String(row.completed_at) : null,
      branch: row.branch ? String(row.branch) : null,
      issueNumber: row.issue_number === null ? null : Number(row.issue_number),
      pullRequestNumber:
        row.pull_request_number === null
          ? null
          : Number(row.pull_request_number),
    };
  }
}
