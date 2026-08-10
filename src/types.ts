export const TASK_STATUSES = [
  "TODO",
  "IN_PROGRESS",
  "IN_REVIEW",
  "BLOCKED",
  "COMPLETED",
  "CLOSED",
] as const;
export type TaskStatus = (typeof TASK_STATUSES)[number];

export const PRIORITIES = ["LOW", "MEDIUM", "HIGH", "CRITICAL"] as const;
export type Priority = (typeof PRIORITIES)[number];

export type WorkflowStrategy = "gitflow" | "trunk";

export interface Project {
  id: string;
  name: string;
  rootPath: string;
  remoteUrl: string | null;
  owner: string | null;
  repository: string | null;
  defaultBranch: string;
  workflowStrategy: WorkflowStrategy;
  createdAt: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: Priority;
  labels: string[];
  assignee: string | null;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
  branch: string | null;
  issueNumber: number | null;
  pullRequestNumber: number | null;
}

export interface Config {
  "workflow.strategy": WorkflowStrategy;
  "git.defaultBranch": string;
  "branch.prefix": string;
  "github.autoLinkIssues": boolean;
  "github.autoCreatePR": boolean;
  "workflow.autoMerge": boolean;
  "workflow.deleteMergedBranches": boolean;
  "report.output": string;
  "commit.conventional": boolean;
}

export interface RepositorySummary {
  branch: string;
  clean: boolean;
  staged: number;
  modified: number;
  untracked: number;
  ahead: number;
  behind: number;
  commits: number;
  tracking: string | null;
}

export interface PullRequestSnapshot {
  number: number;
  title: string;
  author: string;
  head: string;
  base: string;
  state: string;
  mergeable: boolean | null;
  additions: number;
  deletions: number;
  changedFiles: number;
  ci: "PASSED" | "FAILED" | "PENDING" | "UNKNOWN";
  approvals: number;
  changeRequests: number;
  unresolvedComments: number;
  url: string;
}

export interface DoctorCheck {
  name: string;
  status: "ok" | "warn" | "fail";
  detail: string;
  fixable?: boolean;
}
