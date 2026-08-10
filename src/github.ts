import { Octokit } from "@octokit/rest";
import type { PullRequestSnapshot } from "./types.js";
import { DevFlowError } from "./utils.js";

export class GitHubClient {
  private readonly client: Octokit;

  constructor(
    private readonly owner: string,
    private readonly repository: string,
    token = process.env.DEVFLOW_GITHUB_TOKEN,
  ) {
    if (!token) {
      throw new DevFlowError(
        "GitHub authentication is not configured.",
        "Set DEVFLOW_GITHUB_TOKEN in your shell, then retry. Tokens are never stored by DevFlow.",
      );
    }
    this.client = new Octokit({ auth: token });
  }

  async authStatus(): Promise<{ login: string; scopes: string[] }> {
    try {
      const response = await this.client.rest.users.getAuthenticated();
      const scopes =
        response.headers["x-oauth-scopes"]
          ?.split(",")
          .map((scope) => scope.trim())
          .filter(Boolean) ?? [];
      return { login: response.data.login, scopes };
    } catch (error) {
      throw new DevFlowError(
        `GitHub authentication failed: ${error instanceof Error ? error.message : "unknown error"}`,
      );
    }
  }

  async listIssues(
    state: "open" | "closed" | "all" = "open",
  ): Promise<
    Array<{ number: number; title: string; state: string; url: string }>
  > {
    const result = await this.client.rest.issues.listForRepo({
      owner: this.owner,
      repo: this.repository,
      state,
      per_page: 100,
    });
    return result.data
      .filter((issue) => !issue.pull_request)
      .map((issue) => ({
        number: issue.number,
        title: issue.title,
        state: issue.state,
        url: issue.html_url,
      }));
  }

  async issue(number: number): Promise<{
    number: number;
    title: string;
    body: string;
    state: string;
    url: string;
    labels: string[];
  }> {
    const result = await this.client.rest.issues.get({
      owner: this.owner,
      repo: this.repository,
      issue_number: number,
    });
    return {
      number: result.data.number,
      title: result.data.title,
      body: result.data.body ?? "",
      state: result.data.state,
      url: result.data.html_url,
      labels: result.data.labels.map((label) =>
        typeof label === "string" ? label : (label.name ?? ""),
      ),
    };
  }

  async createIssue(
    title: string,
    body: string,
    labels: string[],
  ): Promise<{ number: number; title: string; url: string }> {
    const result = await this.client.rest.issues.create({
      owner: this.owner,
      repo: this.repository,
      title,
      body,
      labels,
    });
    return {
      number: result.data.number,
      title: result.data.title,
      url: result.data.html_url,
    };
  }

  async setIssueState(number: number, state: "open" | "closed"): Promise<void> {
    await this.client.rest.issues.update({
      owner: this.owner,
      repo: this.repository,
      issue_number: number,
      state,
    });
  }

  async listPulls(
    state: "open" | "closed" | "all" = "open",
  ): Promise<PullRequestSnapshot[]> {
    const result = await this.client.rest.pulls.list({
      owner: this.owner,
      repo: this.repository,
      state,
      per_page: 100,
    });
    return Promise.all(result.data.map((pr) => this.pullRequest(pr.number)));
  }

  async pullRequest(number: number): Promise<PullRequestSnapshot> {
    const [pull, reviews, files, checks] = await Promise.all([
      this.client.rest.pulls.get({
        owner: this.owner,
        repo: this.repository,
        pull_number: number,
      }),
      this.client.rest.pulls.listReviews({
        owner: this.owner,
        repo: this.repository,
        pull_number: number,
        per_page: 100,
      }),
      this.client.rest.pulls.listFiles({
        owner: this.owner,
        repo: this.repository,
        pull_number: number,
        per_page: 100,
      }),
      this.client.rest.checks.listForRef({
        owner: this.owner,
        repo: this.repository,
        ref: `pull/${number}/head`,
      }),
    ]);
    const latestReviews = new Map<string, string>();
    for (const review of reviews.data)
      latestReviews.set(review.user?.login ?? String(review.id), review.state);
    const approvals = [...latestReviews.values()].filter(
      (state) => state === "APPROVED",
    ).length;
    const changeRequests = [...latestReviews.values()].filter(
      (state) => state === "CHANGES_REQUESTED",
    ).length;
    const checkRuns = checks.data.check_runs;
    const ci =
      checkRuns.length === 0
        ? "UNKNOWN"
        : checkRuns.some((check) => check.conclusion === "failure")
          ? "FAILED"
          : checkRuns.some((check) => !check.completed_at)
            ? "PENDING"
            : "PASSED";
    return {
      number: pull.data.number,
      title: pull.data.title,
      author: pull.data.user?.login ?? "unknown",
      head: pull.data.head.ref,
      base: pull.data.base.ref,
      state: pull.data.state,
      mergeable: pull.data.mergeable,
      additions: pull.data.additions,
      deletions: pull.data.deletions,
      changedFiles: files.data.length,
      ci,
      approvals,
      changeRequests,
      unresolvedComments: 0,
      url: pull.data.html_url,
    };
  }

  async createPullRequest(
    title: string,
    body: string,
    head: string,
    base: string,
  ): Promise<PullRequestSnapshot> {
    const result = await this.client.rest.pulls.create({
      owner: this.owner,
      repo: this.repository,
      title,
      body,
      head,
      base,
    });
    return this.pullRequest(result.data.number);
  }

  async review(
    number: number,
    event: "APPROVE" | "REQUEST_CHANGES",
  ): Promise<void> {
    await this.client.rest.pulls.createReview({
      owner: this.owner,
      repo: this.repository,
      pull_number: number,
      event,
    });
  }

  async merge(
    number: number,
    method: "merge" | "squash" | "rebase" = "squash",
  ): Promise<void> {
    const result = await this.client.rest.pulls.merge({
      owner: this.owner,
      repo: this.repository,
      pull_number: number,
      merge_method: method,
    });
    if (!result.data.merged)
      throw new DevFlowError(
        `GitHub did not merge PR #${number}: ${result.data.message}`,
      );
  }

  async closePullRequest(number: number): Promise<void> {
    await this.client.rest.pulls.update({
      owner: this.owner,
      repo: this.repository,
      pull_number: number,
      state: "closed",
    });
  }

  async checkoutPull(number: number): Promise<string> {
    const result = await this.client.rest.pulls.get({
      owner: this.owner,
      repo: this.repository,
      pull_number: number,
    });
    return result.data.head.ref;
  }
}
