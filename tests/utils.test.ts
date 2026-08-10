import { describe, expect, it } from "vitest";
import { branchName, parseRemote, sanitizeBranchPart } from "../src/utils.js";

describe("branch naming", () => {
  it("creates a safe, readable task branch", () => {
    expect(
      branchName("feature", "task-001", "Implement OAuth & GitHub login!"),
    ).toBe("feature/TASK-001-implement-oauth-github-login");
  });

  it("normalizes punctuation and whitespace", () => {
    expect(sanitizeBranchPart("  Fix   broken/api_route  ")).toBe(
      "fix-brokenapi-route",
    );
  });
});

describe("remote parsing", () => {
  it("supports SSH and HTTPS GitHub remotes", () => {
    expect(parseRemote("git@github.com:acme/devflow.git")).toEqual({
      owner: "acme",
      repository: "devflow",
    });
    expect(parseRemote("https://github.com/acme/devflow")).toEqual({
      owner: "acme",
      repository: "devflow",
    });
  });
});
