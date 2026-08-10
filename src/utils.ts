import chalk from "chalk";
import { createHash } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

export class DevFlowError extends Error {
  constructor(
    message: string,
    public readonly suggestion?: string,
    public readonly exitCode = 1,
  ) {
    super(message);
    this.name = "DevFlowError";
  }
}

export function now(): string {
  return new Date().toISOString();
}

export function output(value: unknown, json: boolean): void {
  if (json) {
    console.log(JSON.stringify(value, null, 2));
    return;
  }
  if (typeof value === "string") {
    console.log(value);
    return;
  }
  console.log(value);
}

export function success(message: string): void {
  console.log(`${chalk.green("✓")} ${message}`);
}

export function warning(message: string): void {
  console.log(`${chalk.yellow("⚠")} ${message}`);
}

export function info(message: string): void {
  console.log(`${chalk.cyan("ℹ")} ${message}`);
}

export function fail(message: string): void {
  console.error(`${chalk.red("✗")} ${message}`);
}

export function section(title: string): void {
  console.log(`\n${chalk.bold.cyan(title)}`);
  console.log(
    chalk.dim("─".repeat(Math.min(72, Math.max(24, title.length + 8)))),
  );
}

export function parseCommaList(value?: string): string[] {
  return value
    ? value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)
    : [];
}

export function sanitizeBranchPart(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
}

export function branchName(
  prefix: string,
  taskId: string,
  title: string,
): string {
  const taskPart = taskId.toUpperCase().replace(/[^A-Z0-9-]/g, "-");
  const titlePart = sanitizeBranchPart(title) || "task";
  return `${prefix.replace(/\/?$/, "/")}${taskPart}-${titlePart}`;
}

export function safeJsonParse<T>(path: string, fallback: T): T {
  if (!existsSync(path)) return fallback;
  try {
    return JSON.parse(readFileSync(path, "utf8")) as T;
  } catch {
    return fallback;
  }
}

export function writeJson(path: string, value: unknown): void {
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

export function ensureParent(path: string): void {
  const parent = dirname(resolve(path));
  if (!existsSync(parent)) {
    throw new DevFlowError(`Parent directory does not exist: ${parent}`);
  }
}

export function parseRemote(remote: string | null): {
  owner: string | null;
  repository: string | null;
} {
  if (!remote) return { owner: null, repository: null };
  const normalized = remote
    .replace(/^git@github\.com:/, "https://github.com/")
    .replace(/^ssh:\/\/git@github\.com\//, "https://github.com/")
    .replace(/\.git$/, "")
    .replace(/\/$/, "");
  const match = normalized.match(/github\.com\/([^/]+)\/([^/]+)$/i);
  return match
    ? { owner: match[1], repository: match[2] }
    : { owner: null, repository: null };
}

export function shortHash(value: string): string {
  return createHash("sha256").update(value).digest("hex").slice(0, 12);
}

export function statusIcon(status: "ok" | "warn" | "fail"): string {
  return status === "ok"
    ? chalk.green("✓")
    : status === "warn"
      ? chalk.yellow("⚠")
      : chalk.red("✗");
}

export function asRecord(value: unknown): Record<string, unknown> {
  return typeof value === "object" && value !== null
    ? (value as Record<string, unknown>)
    : {};
}
