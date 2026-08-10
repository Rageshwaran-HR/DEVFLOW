import { describe, expect, it } from "vitest";
import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { ConfigManager, DEFAULT_CONFIG } from "../src/config.js";
import { DevFlowError } from "../src/utils.js";

describe("ConfigManager", () => {
  it("initializes and persists validated defaults", () => {
    const root = mkdtempSync(join(tmpdir(), "devflow-config-"));
    const manager = new ConfigManager(root);
    expect(manager.initialize()).toEqual(DEFAULT_CONFIG);
    expect(JSON.parse(readFileSync(manager.filePath, "utf8"))).toEqual(
      DEFAULT_CONFIG,
    );
    expect(
      manager.set("workflow.strategy", "gitflow")["workflow.strategy"],
    ).toBe("gitflow");
  });

  it("rejects invalid configuration values", () => {
    const root = mkdtempSync(join(tmpdir(), "devflow-config-"));
    const manager = new ConfigManager(root);
    manager.initialize();
    expect(() => manager.set("workflow.strategy", "waterfall")).toThrow(
      DevFlowError,
    );
    expect(() => manager.set("workflow.autoMerge", "yes")).toThrow(
      DevFlowError,
    );
  });
});
