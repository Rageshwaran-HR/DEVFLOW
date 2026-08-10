# Complete DevFlow Command Reference

## 🤖 AI Copilot & Workflow Intelligence

| Command                    | Options                                                    | Purpose                                                                                                      |
| :------------------------- | :--------------------------------------------------------- | :----------------------------------------------------------------------------------------------------------- |
| `devflow next`             | —                                                          | AI workflow assistant recommending your next command based on git tree & task state                          |
| `devflow ai task <prompt>` | —                                                          | AI task generator: converts prompt into structured title, description, priority, & labels                    |
| `devflow ai plan <goal>`   | —                                                          | AI feature architect: breaks down a high-level goal into implementation subtasks                             |
| `devflow ai commit`        | `--all`                                                    | AI conventional commit generator: analyzes staged diff and commits automatically                             |
| `devflow ai audit`         | `-b, --branch <name>`, `-r, --repo`, `-o, --output <path>` | AI Quality & Risk Audit: flags exact problem files, commit hashes, branch risks, & generates markdown report |
| `devflow changelog`        | `-o, --output <path>`                                      | Automated Conventional Commit changelog builder grouped by type and scope                                    |

## 🔄 Multi-Branch Sync & Stashes

| Command                    | Options | Purpose                                                                           |
| :------------------------- | :------ | :-------------------------------------------------------------------------------- |
| `devflow sync`             | —       | 1-Click push of all local feature, dev, qual, and main branches cleanly to GitHub |
| `devflow stash save [msg]` | —       | Stash uncommitted local modifications with custom description                     |
| `devflow stash list`       | —       | List all stashes in clean UI format                                               |
| `devflow stash pop`        | —       | Apply and remove top stash                                                        |
| `devflow stash apply [id]` | —       | Apply a stash without removing it                                                 |
| `devflow stash drop [id]`  | —       | Drop a specific stash                                                             |

## 📝 Tasks & Automation

| Command                      | Options                                            | Purpose                                                                   |
| :--------------------------- | :------------------------------------------------- | :------------------------------------------------------------------------ |
| `devflow task add <title>`   | `--priority <p>`, `--labels <l>`, `--assignee <a>` | Create a local task in SQLite database                                    |
| `devflow task list`          | `--status <s                                       | TODO                                                                      | IN_PROGRESS | COMPLETED | CLOSED>` | List local tasks |
| `devflow task show <id>`     | —                                                  | Display complete task details                                             |
| `devflow task complete <id>` | —                                                  | Mark a task as completed                                                  |
| `devflow task reopen <id>`   | —                                                  | Reopen a completed task                                                   |
| `devflow task delete <id>`   | `--yes`                                            | Delete a task safely                                                      |
| `devflow start <id>`         | —                                                  | Create feature branch `feature/<id>-<title>` & switch task to IN_PROGRESS |
| `devflow finish <id>`        | `--merge`, `--yes`                                 | Guarded completion check, PR merge, and branch cleanup                    |

## 🌿 Git & Conventional Commits

| Command                        | Options                                               | Purpose                                          |
| :----------------------------- | :---------------------------------------------------- | :----------------------------------------------- |
| `devflow branch list`          | —                                                     | List local branches & associated task IDs        |
| `devflow branch show`          | —                                                     | Display active branch & task association         |
| `devflow branch cleanup`       | `--yes`                                               | Safely delete merged local branches              |
| `devflow branch delete <name>` | `--yes`                                               | Delete a local branch                            |
| `devflow git status`           | —                                                     | Show clean status summary                        |
| `devflow git diff`             | `--staged`                                            | Show unstaged or staged diff                     |
| `devflow git log`              | `--count <n>`                                         | Show recent commit history                       |
| `devflow git push`             | `--set-upstream`, `--all`                             | Push current branch or all branches to remote    |
| `devflow git push-all`         | —                                                     | Push all local branches to remote                |
| `devflow git pull / fetch`     | —                                                     | Pull / fetch updates from origin                 |
| `devflow git merge <branch>`   | —                                                     | Safe merge with formatted conflict error reports |
| `devflow git rebase <branch>`  | —                                                     | Rebase current branch                            |
| `devflow commit`               | `--type <t>`, `--scope <s>`, `--message <m>`, `--all` | Conventional Commit generator with AI fallback   |

## 🐙 GitHub Integration

| Command                          | Options                    | Purpose                                                           |
| :------------------------------- | :------------------------- | :---------------------------------------------------------------- |
| `devflow auth status`            | —                          | Validate GitHub API authentication token (`DEVFLOW_GITHUB_TOKEN`) |
| `devflow issue list`             | —                          | List open GitHub issues                                           |
| `devflow issue create`           | `--task <id>`              | Create a GitHub issue from local task                             |
| `devflow issue show <#>`         | —                          | Show issue details                                                |
| `devflow issue link <task> <#>`  | —                          | Link a local task to GitHub issue                                 |
| `devflow issue close/reopen <#>` | —                          | Close or reopen an issue                                          |
| `devflow pr create`              | `--task <id>`              | Create a Pull Request from active branch                          |
| `devflow pr list`                | —                          | List open Pull Requests                                           |
| `devflow pr show <#>`            | —                          | Show PR state and CI details                                      |
| `devflow pr checkout <#>`        | —                          | Checkout PR branch locally                                        |
| `devflow pr approve <#>`         | —                          | Approve a Pull Request                                            |
| `devflow pr request-changes <#>` | —                          | Request changes on a PR                                           |
| `devflow pr merge <#>`           | `--yes`, `--method <squash | merge                                                             | rebase>` | Merge PR safely |
| `devflow review <#>`             | —                          | Inspect PR review approvals & CI state                            |
| `devflow review check <#>`       | —                          | Non-zero exit code if PR is not merge-ready (for CI scripts)      |

## 📊 Reporting, Diagnostics & System

| Command                       | Options           | Purpose                                             |
| :---------------------------- | :---------------- | :-------------------------------------------------- |
| `devflow status`              | `--json`          | Current branch and task status overview             |
| `devflow dashboard`           | —                 | Interactive live terminal project overview          |
| `devflow doctor`              | `--fix`           | Repository health diagnostics doctor                |
| `devflow report`              | `--output <path>` | Generate Markdown development report                |
| `devflow readme`              | `--file <path>`   | Safely update README DevFlow status block           |
| `devflow workflow show/set`   | `<trunk           | gitflow>`                                           | Manage branching strategy |
| `devflow config list/get/set` | `<key> [value]`   | View or update local configuration settings         |
| `devflow init`                | `--yes`           | Initialize DevFlow SQLite database & Git repository |

_All list and query commands support the `--json` option for machine-readable JSON output._
