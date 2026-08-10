import { existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { z } from "zod";
import type { Config, WorkflowStrategy } from "./types.js";
import { DevFlowError, safeJsonParse, writeJson } from "./utils.js";

export const DEFAULT_CONFIG: Config = {
  "workflow.strategy": "trunk",
  "git.defaultBranch": "main",
  "branch.prefix": "feature",
  "github.autoLinkIssues": true,
  "github.autoCreatePR": false,
  "workflow.autoMerge": false,
  "workflow.deleteMergedBranches": false,
  "report.output": "devflow-report.md",
  "commit.conventional": true,
};

const configSchema = z.object({
  "workflow.strategy": z.enum(["gitflow", "trunk"]),
  "git.defaultBranch": z.string().min(1),
  "branch.prefix": z.string().regex(/^[a-z][a-z0-9-]*$/),
  "github.autoLinkIssues": z.boolean(),
  "github.autoCreatePR": z.boolean(),
  "workflow.autoMerge": z.boolean(),
  "workflow.deleteMergedBranches": z.boolean(),
  "report.output": z.string().min(1),
  "commit.conventional": z.boolean(),
});

export class ConfigManager {
  public readonly directory: string;
  public readonly filePath: string;
  public readonly databasePath: string;

  constructor(public readonly rootPath: string) {
    this.directory = join(rootPath, ".devflow");
    this.filePath = join(this.directory, "config.json");
    this.databasePath = join(this.directory, "devflow.db");
  }

  exists(): boolean {
    return existsSync(this.filePath);
  }

  ensureDirectory(): void {
    mkdirSync(this.directory, { recursive: true });
  }

  load(): Config {
    const raw = safeJsonParse<Partial<Config>>(this.filePath, {});
    const parsed = configSchema.safeParse({ ...DEFAULT_CONFIG, ...raw });
    if (!parsed.success) {
      throw new DevFlowError(
        "DevFlow configuration is invalid.",
        `Run \`devflow config set <key> <value>\` to correct it.`,
      );
    }
    return parsed.data;
  }

  initialize(overrides: Partial<Config> = {}): Config {
    this.ensureDirectory();
    const config = configSchema.parse({ ...DEFAULT_CONFIG, ...overrides });
    writeJson(this.filePath, config);
    return config;
  }

  set(key: string, value: string): Config {
    const current = this.load();
    if (!(key in current))
      throw new DevFlowError(`Unknown configuration key: ${key}`);
    const typedValue = this.coerce(key as keyof Config, value);
    const next = configSchema.parse({ ...current, [key]: typedValue });
    writeJson(this.filePath, next);
    return next;
  }

  private coerce(
    key: keyof Config,
    value: string,
  ): string | boolean | WorkflowStrategy {
    if (key === "workflow.strategy") {
      if (value !== "gitflow" && value !== "trunk") {
        throw new DevFlowError(
          `Invalid workflow strategy: ${value}`,
          "Use gitflow or trunk.",
        );
      }
      return value;
    }
    if (
      key === "github.autoLinkIssues" ||
      key === "github.autoCreatePR" ||
      key === "workflow.autoMerge" ||
      key === "workflow.deleteMergedBranches" ||
      key === "commit.conventional"
    ) {
      if (value !== "true" && value !== "false") {
        throw new DevFlowError(
          `Invalid boolean value: ${value}`,
          "Use true or false.",
        );
      }
      return value === "true";
    }
    if (!value.trim())
      throw new DevFlowError(`Configuration value for ${key} cannot be empty.`);
    return value;
  }
}
