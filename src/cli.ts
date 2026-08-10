import { Command } from "commander";
import chalk from "chalk";
import ora from "ora";
import { basename, resolve } from "node:path";
import { ConfigManager } from "./config.js";
import { Database } from "./database.js";
import { GitManager } from "./git.js";
import { GitHubClient } from "./github.js";
import {
  buildReadmeSection,
  buildReport,
  buildChangelog,
  updateReadme,
  writeReport,
} from "./markdown.js";
import {
  PRIORITIES,
  TASK_STATUSES,
  type Priority,
  type TaskStatus,
} from "./types.js";
import {
  DevFlowError,
  branchName,
  info,
  output,
  parseCommaList,
  section,
  success,
  warning,
} from "./utils.js";
import { formatDoctor, runDoctor } from "./doctor.js";

export function createCli(rootPath = process.cwd()): Command {
  const program = new Command();
  program
    .name("devflow")
    .description("Developer Workflow Command Center")
    .version("0.1.0")
    .option("--json", "Output machine-readable JSON where supported");

  const json = (_command?: unknown): boolean => process.argv.includes("--json");
  const requireState = (): {
    config: ConfigManager;
    db: Database;
    git: GitManager;
  } => {
    const config = new ConfigManager(rootPath);
    const db = new Database(config.databasePath);
    return { config, db, git: new GitManager(rootPath) };
  };
  const taskId = (value: string): string => value.toUpperCase();
  const action = <T extends unknown[]>(
    handler: (...args: T) => Promise<void>,
  ): ((...args: T) => Promise<void>) => handler;

  program
    .command("init")
    .description("Initialize DevFlow in the current Git repository")
    .option(
      "--yes",
      "Initialize Git automatically when no repository is detected",
    )
    .action(
      action(async (options: { yes?: boolean }) => {
        const git = new GitManager(rootPath);
        let isRepo = await git.isRepository();
        if (!isRepo) {
          if (!options.yes)
            throw new DevFlowError(
              "Current directory is not a Git repository.",
              "Run `devflow init --yes` to initialize Git safely.",
            );
          await git.initialize();
          isRepo = true;
        }
        const remote = await git.remote();
        const repository = new ConfigManager(rootPath);
        const defaultBranch = await git.defaultBranch();
        const parsed = (await import("./utils.js")).parseRemote(remote);
        const config = repository.initialize({
          "git.defaultBranch": defaultBranch,
        });
        const db = new Database(repository.databasePath, true);
        db.saveConfig(config);
        db.saveProject({
          id: (await import("./utils.js")).shortHash(rootPath),
          name: basename(resolve(rootPath)),
          rootPath: resolve(rootPath),
          remoteUrl: remote,
          owner: parsed.owner,
          repository: parsed.repository,
          defaultBranch,
          workflowStrategy: config["workflow.strategy"],
          createdAt: new Date().toISOString(),
        });
        db.close();
        section("DevFlow Initialization");
        success(
          isRepo ? "Git repository detected" : "Git repository initialized",
        );
        remote ? success("Remote detected") : warning("No Git remote detected");
        parsed.owner && parsed.repository
          ? success(
              `GitHub repository detected: ${parsed.owner}/${parsed.repository}`,
            )
          : info("GitHub repository not detected");
        success("Database initialized");
        console.log(
          `\nProject: ${basename(resolve(rootPath))}\nRemote: ${remote ?? "none"}\nDefault branch: ${defaultBranch}\n`,
        );
        success("DevFlow initialized successfully.");
      }),
    );

  const task = program
    .command("task")
    .description("Manage local development tasks");
  task
    .command("add <title>")
    .description("Create a task")
    .option("-d, --description <text>", "Task description", "")
    .option("-p, --priority <priority>", "Priority", "MEDIUM")
    .option("-l, --labels <labels>", "Comma-separated labels")
    .option("-a, --assignee <name>", "Assignee")
    .action(
      action(
        async (
          title: string,
          options: {
            description: string;
            priority: string;
            labels?: string;
            assignee?: string;
          },
          command: Command,
        ) => {
          const state = requireState();
          const priority = options.priority.toUpperCase() as Priority;
          if (!PRIORITIES.includes(priority))
            throw new DevFlowError(
              `Invalid priority: ${options.priority}`,
              `Use one of: ${PRIORITIES.join(", ")}`,
            );
          const created = state.db.addTask({
            title,
            description: options.description,
            priority,
            labels: parseCommaList(options.labels),
            assignee: options.assignee ?? null,
          });
          state.db.close();
          output(created, json(command));
          if (!json(command))
            success(`Created ${created.id}: ${created.title}`);
        },
      ),
    );
  task
    .command("list")
    .description("List tasks")
    .option("-s, --status <status>", "Filter by status")
    .action(
      action(async (options: { status?: string }, command: Command) => {
        const state = requireState();
        const status = options.status?.toUpperCase() as TaskStatus | undefined;
        if (status && !TASK_STATUSES.includes(status))
          throw new DevFlowError(
            `Invalid status: ${options.status}`,
            `Use one of: ${TASK_STATUSES.join(", ")}`,
          );
        const tasks = state.db.listTasks(status);
        state.db.close();
        if (json(command)) return output(tasks, true);
        if (!tasks.length)
          return info(
            'No tasks yet. Run `devflow task add "Your task"` to create one.',
          );
        console.log(
          tasks
            .map(
              (item) =>
                `${item.id.padEnd(10)} ${item.status.padEnd(12)} ${item.priority.padEnd(8)} ${item.title}${item.branch ? chalk.dim(`  [${item.branch}]`) : ""}`,
            )
            .join("\n"),
        );
      }),
    );
  task
    .command("show <id>")
    .description("Show a task")
    .action(
      action(async (id: string, command: Command) => {
        const state = requireState();
        const value = state.db.getTask(taskId(id));
        state.db.close();
        output(value, json(command));
      }),
    );
  for (const transition of ["start", "complete", "close", "reopen"] as const) {
    task
      .command(`${transition} <id>`)
      .description(
        `${transition[0].toUpperCase()}${transition.slice(1)} a task`,
      )
      .action(
        action(async (id: string, command: Command) => {
          const state = requireState();
          const status: TaskStatus =
            transition === "start"
              ? "IN_PROGRESS"
              : transition === "complete"
                ? "COMPLETED"
                : transition === "close"
                  ? "CLOSED"
                  : "TODO";
          const value = state.db.updateTask(taskId(id), { status });
          state.db.close();
          output(value, json(command));
          if (!json(command)) success(`${value.id} is now ${value.status}`);
        }),
      );
  }
  task
    .command("delete <id>")
    .description("Delete a task")
    .option("--yes", "Confirm deletion")
    .action(
      action(
        async (id: string, options: { yes?: boolean }, command: Command) => {
          if (!options.yes)
            throw new DevFlowError(
              "Deleting a task requires explicit confirmation.",
              "Pass --yes if this deletion is intentional.",
            );
          const state = requireState();
          state.db.deleteTask(taskId(id));
          state.db.close();
          if (json(command)) output({ deleted: taskId(id) }, true);
          else success(`Deleted ${taskId(id)}`);
        },
      ),
    );

  const branch = program.command("branch").description("Manage local branches");
  branch
    .command("list")
    .description("List branches")
    .action(
      action(async (command: Command) => {
        const git = new GitManager(rootPath);
        const result = await git.branches();
        output(
          result.all.map((name) => ({
            name,
            current: name === result.current,
          })),
          json(command),
        );
        if (!json(command))
          console.log(
            result.all
              .map(
                (name) =>
                  `${name === result.current ? chalk.green("*") : " "} ${name}`,
              )
              .join("\n"),
          );
      }),
    );
  branch
    .command("create <name>")
    .description("Create and switch to a branch")
    .action(
      action(async (name: string) => {
        await new GitManager(rootPath).createBranch(name);
        success(`Created and switched to ${name}`);
      }),
    );
  branch
    .command("switch <name>")
    .description("Switch branches")
    .action(
      action(async (name: string) => {
        await new GitManager(rootPath).switchBranch(name);
        success(`Switched to ${name}`);
      }),
    );
  branch
    .command("delete <name>")
    .description("Delete a local branch")
    .option("--yes", "Confirm deletion")
    .action(
      action(async (name: string, options: { yes?: boolean }) => {
        if (!options.yes)
          throw new DevFlowError(
            "Branch deletion requires explicit confirmation.",
            "Pass --yes if this deletion is intentional.",
          );
        await new GitManager(rootPath).deleteBranch(name);
        success(`Deleted ${name}`);
      }),
    );
  branch
    .command("cleanup")
    .description("Delete local branches already merged into the default branch")
    .option("--yes", "Confirm cleanup")
    .action(
      action(async (options: { yes?: boolean }) => {
        const state = requireState();
        if (!options.yes)
          throw new DevFlowError(
            "Branch cleanup requires explicit confirmation.",
            "Pass --yes after reviewing merged branches.",
          );
        const deleted = await state.git.cleanupBranches(
          state.config.load()["git.defaultBranch"],
        );
        state.db.close();
        if (deleted.length)
          success(`Deleted ${deleted.length} merged branch(es)`);
        else info("No safe merged branches found.");
      }),
    );

  const gitCommand = program
    .command("git")
    .description("Run safe Git workflow operations");
  gitCommand
    .command("status")
    .description("Show repository status")
    .action(
      action(async (command: Command) => {
        const value = await new GitManager(rootPath).summary();
        output(value, json(command));
        if (!json(command))
          console.log(
            `${chalk.bold(value.branch)} ${value.clean ? chalk.green("clean") : chalk.yellow("changes pending")} · ${value.ahead} ahead · ${value.behind} behind`,
          );
      }),
    );
  gitCommand
    .command("log")
    .description("Show recent commits")
    .option("-n, --count <count>", "Number of commits", "20")
    .action(
      action(async (options: { count: string }, command: Command) => {
        const value = await new GitManager(rootPath).log(Number(options.count));
        output(value.all, json(command));
        if (!json(command))
          console.log(
            value.all
              .map(
                (commit) =>
                  `${chalk.yellow(commit.hash.slice(0, 8))} ${commit.date} ${commit.message}`,
              )
              .join("\n"),
          );
      }),
    );
  gitCommand
    .command("diff")
    .description("Show unstaged changes")
    .action(
      action(async () => console.log(await new GitManager(rootPath).diff())),
    );
  for (const operation of ["fetch", "pull"] as const)
    gitCommand
      .command(operation)
      .description(
        `${operation[0].toUpperCase()}${operation.slice(1)} from origin`,
      )
      .action(
        action(async () => {
          await new GitManager(rootPath)[operation]();
          success(`Git ${operation} completed`);
        }),
      );
  gitCommand
    .command("push")
    .description("Push the current branch")
    .option("--set-upstream", "Set upstream on first push")
    .option("--all", "Push all branches to remote")
    .action(
      action(
        async (
          options: { setUpstream?: boolean; all?: boolean },
          command: Command,
        ) => {
          const git = new GitManager(rootPath);
          if (options.all) {
            const spinner = ora(
              "Pushing all branches to remote GitHub...",
            ).start();
            try {
              const res = await git.pushAll();
              spinner.stop();
              output(res, json(command));
              if (!json(command)) {
                section("DevFlow GitHub Sync");
                success(
                  `Pushed ${res.pushedBranches.length} branches to GitHub remote`,
                );
                if (res.remoteUrl) info(`Remote: ${res.remoteUrl}`);
                console.log(
                  res.pushedBranches
                    .map((b) => `  ${chalk.cyan("•")} ${b}`)
                    .join("\n"),
                );
              }
            } catch (err: unknown) {
              spinner.stop();
              const msg = err instanceof Error ? err.message : String(err);
              throw new DevFlowError(`Failed to push all branches: ${msg}`);
            }
            return;
          }
          const status = await git.status();
          if (!status.isClean())
            warning("Pushing a branch with a dirty working tree.");
          await git.push(Boolean(options.setUpstream));
          success("Branch pushed");
        },
      ),
    );

  gitCommand
    .command("push-all")
    .description("Push all local branches to the remote server")
    .action(
      action(async (command: Command) => {
        const git = new GitManager(rootPath);
        const spinner = ora("Pushing all branches to remote GitHub...").start();
        try {
          const res = await git.pushAll();
          spinner.stop();
          output(res, json(command));
          if (!json(command)) {
            section("DevFlow GitHub Sync");
            success(
              `Pushed ${res.pushedBranches.length} branches to GitHub remote`,
            );
            if (res.remoteUrl) info(`Remote: ${res.remoteUrl}`);
            console.log(
              res.pushedBranches
                .map((b) => `  ${chalk.cyan("•")} ${b}`)
                .join("\n"),
            );
          }
        } catch (err: unknown) {
          spinner.stop();
          const msg = err instanceof Error ? err.message : String(err);
          throw new DevFlowError(`Failed to push all branches: ${msg}`);
        }
      }),
    );

  gitCommand
    .command("merge <branch>")
    .description("Safely merge a branch with clean error & conflict reports")
    .action(
      action(async (branchNameValue: string) => {
        const git = new GitManager(rootPath);
        const res = await git.mergeSafe(branchNameValue);
        if (res.success) {
          success(res.message);
        } else {
          if (res.conflicts && res.conflicts.length > 0) {
            warning(res.message);
            console.log(chalk.bold.yellow("\nConflicting files:"));
            console.log(
              res.conflicts.map((f) => `  ${chalk.red("✖")} ${f}`).join("\n"),
            );
            info(
              "\nSuggested action: Resolve conflicts in the files listed above, stage them with `devflow git add`, and run `devflow commit`.",
            );
          } else {
            throw new DevFlowError(res.message);
          }
        }
      }),
    );

  gitCommand
    .command("rebase <branch>")
    .description("Rebase the current branch")
    .action(
      action(async (branchNameValue: string) => {
        await new GitManager(rootPath).rebase(branchNameValue);
        success(`Rebased onto ${branchNameValue}`);
      }),
    );

  const stashCommand = program
    .command("stash")
    .description("Manage git stashes cleanly");

  stashCommand
    .command("save [message]")
    .alias("push")
    .description("Stash uncommitted changes with optional message")
    .action(
      action(async (message?: string) => {
        const git = new GitManager(rootPath);
        const res = await git.stashSave(message);
        success(res || "Stashed uncommitted changes.");
      }),
    );

  stashCommand
    .command("list")
    .description("List all local stashes")
    .action(
      action(async (command: Command) => {
        const git = new GitManager(rootPath);
        const stashes = await git.stashList();
        output(stashes, json(command));
        if (!json(command)) {
          if (stashes.length === 0) {
            info("No stashes found.");
          } else {
            section("Git Stashes");
            console.log(
              stashes
                .map((s) => `  ${chalk.yellow(s.id)} ${s.message}`)
                .join("\n"),
            );
          }
        }
      }),
    );

  stashCommand
    .command("pop")
    .description("Pop and apply the most recent stash")
    .action(
      action(async () => {
        const git = new GitManager(rootPath);
        const res = await git.stashPop();
        success(res || "Applied and popped top stash.");
      }),
    );

  stashCommand
    .command("apply [id]")
    .description("Apply a stash without removing it")
    .action(
      action(async (id?: string) => {
        const git = new GitManager(rootPath);
        const res = await git.stashApply(id);
        success(res || `Applied ${id || "stash@{0}"}.`);
      }),
    );

  stashCommand
    .command("drop [id]")
    .description("Drop a stash")
    .action(
      action(async (id?: string) => {
        const git = new GitManager(rootPath);
        const res = await git.stashDrop(id);
        success(res || `Dropped ${id || "stash@{0}"}.`);
      }),
    );

  program
    .command("sync")
    .description("Push all branches and sync changes to GitHub remote")
    .action(
      action(async (command: Command) => {
        const git = new GitManager(rootPath);
        const spinner = ora("Syncing all branches to GitHub remote...").start();
        try {
          const res = await git.pushAll();
          spinner.stop();
          output(res, json(command));
          if (!json(command)) {
            section("DevFlow GitHub Sync");
            success(
              `Pushed ${res.pushedBranches.length} branches to GitHub remote`,
            );
            if (res.remoteUrl) info(`Remote: ${res.remoteUrl}`);
            console.log(
              res.pushedBranches
                .map((b) => `  ${chalk.cyan("•")} ${b}`)
                .join("\n"),
            );
          }
        } catch (err: unknown) {
          spinner.stop();
          const msg = err instanceof Error ? err.message : String(err);
          throw new DevFlowError(`Failed to sync to GitHub: ${msg}`);
        }
      }),
    );

  program
    .command("start <id>")
    .description("Create a task branch and begin work")
    .action(
      action(async (id: string, command: Command) => {
        const state = requireState();
        const taskValue = state.db.getTask(taskId(id));
        const config = state.config.load();
        const prefix =
          config["branch.prefix"] ||
          (config["workflow.strategy"] === "gitflow" ? "feature" : "feature");
        const generated = branchName(prefix, taskValue.id, taskValue.title);
        await state.git.createBranch(generated);
        state.db.saveBranch(generated, taskValue.id);
        const updated = state.db.updateTask(taskValue.id, {
          status: "IN_PROGRESS",
          branch: generated,
        });
        state.db.close();
        output(updated, json(command));
        if (!json(command)) success(`${updated.id} started on ${generated}`);
      }),
    );

  const commit = program
    .command("commit")
    .description("Create a validated conventional commit")
    .option("--type <type>", "Commit type")
    .option("--scope <scope>", "Commit scope")
    .option("-m, --message <message>", "Commit message")
    .option("--all", "Stage all changes");
  commit.action(
    action(
      async (options: {
        type?: string;
        scope?: string;
        message?: string;
        all?: boolean;
      }) => {
        const git = new GitManager(rootPath);
        const status = await git.status();
        if (status.isClean())
          throw new DevFlowError("There are no changes to commit.");
        if (options.all) await git.add(["."]);
        if (!options.type || !options.message)
          throw new DevFlowError(
            "A conventional commit type and message are required.",
            'Example: devflow commit --type feat --scope auth --message "add login endpoint"',
          );
        const allowed = [
          "feat",
          "fix",
          "docs",
          "style",
          "refactor",
          "test",
          "chore",
          "perf",
          "ci",
          "build",
        ];
        if (!allowed.includes(options.type))
          throw new DevFlowError(
            `Invalid commit type: ${options.type}`,
            `Use one of: ${allowed.join(", ")}`,
          );
        const message = `${options.type}${options.scope ? `(${options.scope})` : ""}: ${options.message.trim()}`;
        const hash = await git.commit(message);
        success(`Created commit ${hash.slice(0, 8)} ${message}`);
      },
    ),
  );

  const auth = program
    .command("auth")
    .description("Check optional GitHub authentication");
  auth
    .command("status")
    .description("Show GitHub authentication status")
    .action(
      action(async (command: Command) => {
        const state = requireState();
        const project = state.db.getProject();
        state.db.close();
        if (!project?.owner || !project.repository)
          throw new DevFlowError(
            "No GitHub repository is associated with this project.",
          );
        const github = new GitHubClient(project.owner, project.repository);
        const status = await github.authStatus();
        output(status, json(command));
        if (!json(command))
          success(`Authenticated to GitHub as ${status.login}`);
      }),
    );
  auth
    .command("logout")
    .description("Explain how to remove the token")
    .action(
      action(async () =>
        info(
          "DevFlow never stores GitHub tokens. Unset DEVFLOW_GITHUB_TOKEN in your shell to log out.",
        ),
      ),
    );

  const issue = program.command("issue").description("Manage GitHub Issues");
  issue
    .command("list")
    .description("List repository issues")
    .option("--state <state>", "open, closed, or all", "open")
    .action(
      action(
        async (
          options: { state: "open" | "closed" | "all" },
          command: Command,
        ) => {
          const state = requireState();
          const project = state.db.getProject();
          state.db.close();
          if (!project?.owner || !project.repository)
            throw new DevFlowError("No GitHub repository detected.");
          const items = await new GitHubClient(
            project.owner,
            project.repository,
          ).listIssues(options.state);
          output(items, json(command));
          if (!json(command))
            console.log(
              items
                .map((item) => `#${item.number} ${item.title} (${item.state})`)
                .join("\n"),
            );
        },
      ),
    );
  issue
    .command("show <number>")
    .description("Show a GitHub Issue")
    .action(
      action(async (number: string, command: Command) => {
        const state = requireState();
        const project = state.db.getProject();
        state.db.close();
        if (!project?.owner || !project.repository)
          throw new DevFlowError("No GitHub repository detected.");
        const item = await new GitHubClient(
          project.owner,
          project.repository,
        ).issue(Number(number));
        output(item, json(command));
        if (!json(command))
          console.log(
            `#${item.number} ${item.title}\n\n${item.body}\n\n${item.url}`,
          );
      }),
    );
  issue
    .command("create")
    .description("Create an Issue from a local task")
    .requiredOption("-t, --task <id>", "Task ID")
    .action(
      action(async (options: { task: string }, command: Command) => {
        const state = requireState();
        const project = state.db.getProject();
        const taskValue = state.db.getTask(taskId(options.task));
        if (!project?.owner || !project.repository)
          throw new DevFlowError("No GitHub repository detected.");
        const created = await new GitHubClient(
          project.owner,
          project.repository,
        ).createIssue(taskValue.title, taskValue.description, taskValue.labels);
        state.db.saveIssue(
          created.number,
          created.title,
          "open",
          created.url,
          taskValue.id,
        );
        const updated = state.db.updateTask(taskValue.id, {
          issueNumber: created.number,
        });
        state.db.close();
        output({ issue: created, task: updated }, json(command));
        if (!json(command))
          success(`Created Issue #${created.number} for ${taskValue.id}`);
      }),
    );
  for (const stateValue of ["close", "reopen"] as const)
    issue
      .command(`${stateValue} <number>`)
      .description(
        `${stateValue[0].toUpperCase()}${stateValue.slice(1)} an Issue`,
      )
      .action(
        action(async (number: string) => {
          const state = requireState();
          const project = state.db.getProject();
          state.db.close();
          if (!project?.owner || !project.repository)
            throw new DevFlowError("No GitHub repository detected.");
          await new GitHubClient(
            project.owner,
            project.repository,
          ).setIssueState(
            Number(number),
            stateValue === "reopen" ? "open" : "closed",
          );
          success(
            `Issue #${number} ${stateValue === "reopen" ? "reopened" : "closed"}`,
          );
        }),
      );
  issue
    .command("link <taskId> <number>")
    .description("Link a local task to an Issue")
    .action(
      action(async (id: string, number: string) => {
        const state = requireState();
        const updated = state.db.updateTask(taskId(id), {
          issueNumber: Number(number),
        });
        state.db.close();
        success(`${updated.id} linked to Issue #${number}`);
      }),
    );

  const pr = program.command("pr").description("Manage GitHub Pull Requests");
  pr.command("list")
    .description("List Pull Requests")
    .option("--state <state>", "open, closed, or all", "open")
    .action(
      action(
        async (
          options: { state: "open" | "closed" | "all" },
          command: Command,
        ) => {
          const state = requireState();
          const project = state.db.getProject();
          state.db.close();
          if (!project?.owner || !project.repository)
            throw new DevFlowError("No GitHub repository detected.");
          const items = await new GitHubClient(
            project.owner,
            project.repository,
          ).listPulls(options.state);
          output(items, json(command));
          if (!json(command))
            console.log(
              items
                .map(
                  (item) =>
                    `#${item.number} ${item.title} ${item.head} → ${item.base} (${item.state})`,
                )
                .join("\n"),
            );
        },
      ),
    );
  pr.command("show <number>")
    .description("Show a Pull Request")
    .action(
      action(async (number: string, command: Command) => {
        const state = requireState();
        const project = state.db.getProject();
        state.db.close();
        if (!project?.owner || !project.repository)
          throw new DevFlowError("No GitHub repository detected.");
        const item = await new GitHubClient(
          project.owner,
          project.repository,
        ).pullRequest(Number(number));
        output(item, json(command));
        if (!json(command))
          console.log(
            `#${item.number} ${item.title}\n${item.head} → ${item.base}\nCI: ${item.ci} · Approvals: ${item.approvals} · Changes requested: ${item.changeRequests}\n${item.url}`,
          );
      }),
    );
  pr.command("create")
    .description("Create a Pull Request from the current branch")
    .option("-t, --task <id>", "Task ID")
    .option("--title <title>", "PR title")
    .option("--body <body>", "PR body")
    .action(
      action(
        async (
          options: { task?: string; title?: string; body?: string },
          command: Command,
        ) => {
          const state = requireState();
          const project = state.db.getProject();
          const current = await state.git.currentBranch();
          const base = state.config.load()["git.defaultBranch"];
          const taskValue = options.task
            ? state.db.getTask(taskId(options.task))
            : state.db.listTasks().find((item) => item.branch === current);
          if (!project?.owner || !project.repository)
            throw new DevFlowError("No GitHub repository detected.");
          const changed = await state.git.changedFiles(base);
          const title =
            options.title ?? taskValue?.title ?? `Changes from ${current}`;
          const body =
            options.body ??
            [
              `## Summary`,
              ``,
              `- ${title}`,
              ``,
              taskValue ? `## Task\n\n${taskValue.id}` : "",
              ``,
              `## Changes`,
              ``,
              `${changed.files.length} files changed`,
              `+${changed.insertions} / -${changed.deletions}`,
            ].join("\n");
          const created = await new GitHubClient(
            project.owner,
            project.repository,
          ).createPullRequest(title, body, current, base);
          if (taskValue) {
            state.db.savePullRequest(
              created.number,
              created.title,
              "open",
              current,
              base,
              created.url,
              taskValue.id,
            );
            state.db.updateTask(taskValue.id, {
              pullRequestNumber: created.number,
              status: "IN_REVIEW",
            });
          }
          state.db.close();
          output(created, json(command));
          if (!json(command)) success(`Created PR #${created.number}`);
        },
      ),
    );
  pr.command("checkout <number>")
    .description("Checkout a Pull Request branch")
    .action(
      action(async (number: string) => {
        const state = requireState();
        const project = state.db.getProject();
        state.db.close();
        if (!project?.owner || !project.repository)
          throw new DevFlowError("No GitHub repository detected.");
        const head = await new GitHubClient(
          project.owner,
          project.repository,
        ).checkoutPull(Number(number));
        await new GitManager(rootPath).switchBranch(head);
        success(`Checked out ${head}`);
      }),
    );
  pr.command("approve <number>")
    .description("Approve a Pull Request")
    .action(
      action(async (number: string) => {
        const project = requireState().db.getProject();
        if (!project?.owner || !project.repository)
          throw new DevFlowError("No GitHub repository detected.");
        await new GitHubClient(project.owner, project.repository).review(
          Number(number),
          "APPROVE",
        );
        success(`Approved PR #${number}`);
      }),
    );
  pr.command("request-changes <number>")
    .description("Request changes on a Pull Request")
    .action(
      action(async (number: string) => {
        const project = requireState().db.getProject();
        if (!project?.owner || !project.repository)
          throw new DevFlowError("No GitHub repository detected.");
        await new GitHubClient(project.owner, project.repository).review(
          Number(number),
          "REQUEST_CHANGES",
        );
        success(`Requested changes on PR #${number}`);
      }),
    );
  pr.command("merge <number>")
    .description("Merge a Pull Request")
    .option("--yes", "Confirm merge")
    .option("--method <method>", "merge, squash, or rebase", "squash")
    .action(
      action(
        async (
          number: string,
          options: { yes?: boolean; method: "merge" | "squash" | "rebase" },
        ) => {
          if (!options.yes)
            throw new DevFlowError(
              "Merging a Pull Request requires explicit confirmation.",
              "Pass --yes after reviewing the PR.",
            );
          const project = requireState().db.getProject();
          if (!project?.owner || !project.repository)
            throw new DevFlowError("No GitHub repository detected.");
          await new GitHubClient(project.owner, project.repository).merge(
            Number(number),
            options.method,
          );
          success(`Merged PR #${number}`);
        },
      ),
    );
  pr.command("close <number>")
    .description("Close a Pull Request")
    .option("--yes", "Confirm close")
    .action(
      action(async (number: string, options: { yes?: boolean }) => {
        if (!options.yes)
          throw new DevFlowError(
            "Closing a Pull Request requires explicit confirmation.",
            "Pass --yes if this is intentional.",
          );
        const project = requireState().db.getProject();
        if (!project?.owner || !project.repository)
          throw new DevFlowError("No GitHub repository detected.");
        await new GitHubClient(
          project.owner,
          project.repository,
        ).closePullRequest(Number(number));
        success(`Closed PR #${number}`);
      }),
    );

  const review = program
    .command("review")
    .description("Inspect Pull Request readiness");
  const reviewAction = action(
    async (number: string | undefined, command: Command) => {
      const state = requireState();
      const project = state.db.getProject();
      const taskValue = state.db
        .listTasks()
        .find(
          (item) =>
            item.pullRequestNumber === (number ? Number(number) : undefined),
        );
      state.db.close();
      if (!project?.owner || !project.repository)
        throw new DevFlowError("No GitHub repository detected.");
      const prNumber = number ? Number(number) : taskValue?.pullRequestNumber;
      if (!prNumber)
        throw new DevFlowError(
          "A Pull Request number is required.",
          "Run `devflow review <number>` or link a PR to a task first.",
        );
      const prValue = await new GitHubClient(
        project.owner,
        project.repository,
      ).pullRequest(prNumber);
      const ready =
        prValue.state === "open" &&
        prValue.ci === "PASSED" &&
        prValue.approvals > 0 &&
        prValue.changeRequests === 0 &&
        prValue.mergeable !== false;
      output({ ...prValue, readyToMerge: ready }, json(command));
      if (!json(command)) {
        console.log(
          `PR #${prValue.number}\n${prValue.title}\n\n${prValue.ci === "PASSED" ? "✓" : "✗"} CI ${prValue.ci}\n${prValue.mergeable === false ? "✗" : "✓"} Branch ${prValue.mergeable === false ? "has conflicts" : "up to date"}\n\nReview:\n${prValue.approvals} approvals\n${prValue.changeRequests} change requests\n${prValue.unresolvedComments} unresolved comments\n\nStatus: ${ready ? chalk.green("READY TO MERGE") : chalk.yellow("NOT READY")}`,
        );
      }
      if (!ready && process.argv.includes("check")) process.exitCode = 2;
    },
  );
  review
    .command("[number]")
    .description("Show review readiness for a PR")
    .action(reviewAction);
  review
    .command("check <number>")
    .description("Return non-zero when a PR is not ready")
    .action(reviewAction);

  program
    .command("status")
    .description("Show task, Git, and GitHub status")
    .action(
      action(async (command: Command) => {
        const state = requireState();
        const project = state.db.getProject();
        const tasks = state.db.listTasks();
        const git = await state.git.summary();
        state.db.close();
        if (json(command))
          return output(
            {
              project,
              task: tasks.find((item) => item.branch === git.branch) ?? null,
              git,
            },
            true,
          );
        section(project?.name ?? "DevFlow");
        console.log(
          `Task: ${tasks.find((item) => item.branch === git.branch)?.id ?? "none"}\nBranch: ${git.branch}\nCommits: ${git.commits}\nUncommitted changes: ${git.clean ? 0 : git.modified + git.staged + git.untracked}\nAhead: ${git.ahead}\nBehind: ${git.behind}`,
        );
      }),
    );
  program
    .command("dashboard")
    .description("Show a live project overview")
    .action(
      action(async (command: Command) => {
        const state = requireState();
        const project = state.db.getProject();
        const tasks = state.db.listTasks();
        const git = await state.git.summary();
        state.db.close();
        const open = tasks.filter(
          (item) => !["COMPLETED", "CLOSED"].includes(item.status),
        );
        if (json(command))
          return output({ project, git, tasks, openTasks: open.length }, true);
        section("DevFlow Dashboard");
        console.log(
          `Project       ${project?.name ?? "unknown"}\nWorkflow      ${project?.workflowStrategy ?? "unknown"}\nBranch        ${git.branch}\nGit           ${git.clean ? chalk.green("clean") : chalk.yellow("changes pending")}\nOpen tasks    ${open.length}\nReview queue  ${tasks.filter((item) => item.status === "IN_REVIEW").length}\n\nRecent tasks`,
        );
        console.log(
          tasks
            .slice(0, 8)
            .map(
              (item) =>
                `${item.id.padEnd(10)} ${item.status.padEnd(12)} ${item.title}`,
            )
            .join("\n") || "No tasks recorded.",
        );
      }),
    );

  const workflow = program
    .command("workflow")
    .description("Configure the branching workflow");
  workflow
    .command("set <strategy>")
    .description("Set gitflow or trunk")
    .action(
      action(async (strategy: string) => {
        const state = requireState();
        const config = state.config.set("workflow.strategy", strategy);
        state.db.saveConfig(config);
        state.db.close();
        success(`Workflow strategy set to ${strategy}`);
      }),
    );
  workflow
    .command("show")
    .description("Show workflow settings")
    .action(
      action(async (command: Command) => {
        const state = requireState();
        const value = state.config.load();
        state.db.close();
        output(value, json(command));
        if (!json(command))
          console.log(
            `Strategy: ${value["workflow.strategy"]}\nDefault branch: ${value["git.defaultBranch"]}\nBranch prefix: ${value["branch.prefix"]}`,
          );
      }),
    );

  const config = program
    .command("config")
    .description("Manage DevFlow configuration");
  config
    .command("list")
    .description("List all settings")
    .action(
      action(async (command: Command) => {
        const state = requireState();
        const value = state.config.load();
        state.db.close();
        output(value, json(command));
        if (!json(command))
          console.log(
            Object.entries(value)
              .map(([key, item]) => `${key.padEnd(32)} ${item}`)
              .join("\n"),
          );
      }),
    );
  config
    .command("get <key>")
    .description("Get a setting")
    .action(
      action(async (key: string, command: Command) => {
        const state = requireState();
        const value = state.config.load() as unknown as Record<string, unknown>;
        state.db.close();
        if (!(key in value))
          throw new DevFlowError(`Unknown configuration key: ${key}`);
        output({ [key]: value[key] }, json(command));
      }),
    );
  config
    .command("set <key> <value>")
    .description("Set a validated setting")
    .action(
      action(async (key: string, value: string) => {
        const state = requireState();
        const next = state.config.set(key, value);
        state.db.saveConfig(next);
        state.db.close();
        success(`Updated ${key}`);
      }),
    );

  program
    .command("finish <id>")
    .description("Validate and finish the task workflow")
    .option("--merge", "Merge the linked PR only when all checks pass")
    .option("--yes", "Confirm merge")
    .action(
      action(
        async (id: string, options: { merge?: boolean; yes?: boolean }) => {
          const state = requireState();
          const taskValue = state.db.getTask(taskId(id));
          const git = await state.git.summary();
          const checks = [
            { name: "working tree", ok: git.clean },
            { name: "task branch", ok: taskValue.branch === git.branch },
            { name: "commits", ok: git.commits > 0 },
            { name: "pull request", ok: Boolean(taskValue.pullRequestNumber) },
          ];
          for (const check of checks)
            console.log(
              `${check.ok ? chalk.green("✓") : chalk.red("✗")} ${check.name}`,
            );
          if (checks.some((check) => !check.ok)) {
            state.db.close();
            throw new DevFlowError(
              "Task is not ready to finish.",
              "Resolve the failed checks, then run `devflow finish` again.",
            );
          }
          if (options.merge) {
            if (!options.yes)
              throw new DevFlowError("Merging during finish requires --yes.");
            const project = state.db.getProject();
            if (!project?.owner || !project.repository)
              throw new DevFlowError("No GitHub repository detected.");
            await new GitHubClient(project.owner, project.repository).merge(
              taskValue.pullRequestNumber as number,
            );
          }
          const updated = state.db.updateTask(taskValue.id, {
            status: "COMPLETED",
          });
          state.db.close();
          success(`${updated.id} completed`);
        },
      ),
    );

  program
    .command("report")
    .description("Generate a Markdown development report")
    .option("-o, --output <path>", "Output path")
    .action(
      action(async (options: { output?: string }, command: Command) => {
        const state = requireState();
        const project = state.db.getProject();
        if (!project)
          throw new DevFlowError(
            "No project metadata found.",
            "Run `devflow init` first.",
          );
        const content = buildReport(
          project,
          state.db.tasksWithRelations(),
          await state.git.summary(),
        );
        const path = writeReport(
          options.output ?? state.config.load()["report.output"],
          content,
        );
        state.db.close();
        output({ path }, json(command));
        if (!json(command)) success(`Report written to ${path}`);
      }),
    );
  program
    .command("readme")
    .description("Generate or update a clearly marked README section")
    .option("-f, --file <path>", "README path", "README.md")
    .action(
      action(async (options: { file: string }) => {
        const state = requireState();
        const project = state.db.getProject();
        if (!project)
          throw new DevFlowError(
            "No project metadata found.",
            "Run `devflow init` first.",
          );
        const result = updateReadme(
          options.file,
          buildReadmeSection(project, state.db.listTasks()),
        );
        state.db.close();
        success(`Updated ${result.path}`);
      }),
    );
  program
    .command("doctor")
    .description("Check repository health")
    .option("--fix", "Apply safe fixes only")
    .action(
      action(async (options: { fix?: boolean }, command: Command) => {
        const checks = await runDoctor(rootPath, new GitManager(rootPath));
        output(checks, json(command));
        if (!json(command)) {
          section("Repository Doctor");
          console.log(formatDoctor(checks));
          if (options.fix)
            info(
              "No files were overwritten. DevFlow only applies fixes it can prove are safe.",
            );
        }
      }),
    );

  program
    .command("next")
    .description(
      "AI-assisted workflow recommendation for what command to run next",
    )
    .action(
      action(async (command: Command) => {
        const state = requireState();
        const git = await state.git.summary();
        const tasks = state.db.listTasks();
        state.db.close();

        section("DevFlow AI Workflow Assistant");
        if (!git.clean) {
          info(
            `Detected ${git.modified + git.untracked + git.staged} uncommitted changes on branch '${git.branch}'.`,
          );
          console.log(`\n💡 ${chalk.bold.green("Recommended Next Step:")}`);
          console.log(
            `   ${chalk.cyan('devflow commit --type feat --message "your commit description" --all')}`,
          );
          return;
        }

        const activeTask = tasks.find((t) => t.status === "IN_PROGRESS");
        if (activeTask) {
          info(
            `Active task '${activeTask.id}: ${activeTask.title}' is currently IN_PROGRESS.`,
          );
          console.log(`\n💡 ${chalk.bold.green("Recommended Next Step:")}`);
          console.log(
            `   ${chalk.cyan(`devflow finish ${activeTask.id}`)} (or ${chalk.cyan(`devflow task complete ${activeTask.id}`)})`,
          );
          return;
        }

        const todoTask = tasks.find((t) => t.status === "TODO");
        if (todoTask) {
          info(
            `Found open task '${todoTask.id}: ${todoTask.title}' in TODO state.`,
          );
          console.log(`\n💡 ${chalk.bold.green("Recommended Next Step:")}`);
          console.log(`   ${chalk.cyan(`devflow start ${todoTask.id}`)}`);
          return;
        }

        if (git.ahead > 0) {
          info(
            `Branch '${git.branch}' has ${git.ahead} local commit(s) not yet pushed.`,
          );
          console.log(`\n💡 ${chalk.bold.green("Recommended Next Step:")}`);
          console.log(
            `   ${chalk.cyan("devflow sync")} (or ${chalk.cyan("devflow git push")})`,
          );
          return;
        }

        success("All local tasks completed and repository is in sync!");
        console.log(`\n💡 ${chalk.bold.green("Recommended Next Step:")}`);
        console.log(
          `   ${chalk.cyan('devflow task add "Your next feature title"')}`,
        );
      }),
    );

  program
    .command("changelog")
    .description("Generate an automated Conventional Commits changelog")
    .option("-o, --output <path>", "Save to file (e.g. CHANGELOG.md)")
    .action(
      action(async (options: { output?: string }, command: Command) => {
        const git = new GitManager(rootPath);
        const logResult = await git.log(100);
        const mapped = logResult.all.map((c) => ({
          hash: c.hash,
          message: c.message,
          date: c.date,
        }));
        const content = buildChangelog(mapped);

        if (options.output) {
          const fileWritten = writeReport(options.output, content);
          success(`Changelog written to ${fileWritten}`);
        } else {
          output(content, json(command));
          if (!json(command)) {
            section("Generated Changelog");
            console.log(content);
          }
        }
      }),
    );

  return program;
}
