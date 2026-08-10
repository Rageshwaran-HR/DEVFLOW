# Commands

## Project and tasks

| Command                                         | Purpose                                            |
| ----------------------------------------------- | -------------------------------------------------- |
| `devflow init`                                  | Detect Git metadata and create local DevFlow state |
| `devflow task add <title>`                      | Create a local task                                |
| `devflow task list`                             | List tasks, optionally filtered by status          |
| `devflow task show <id>`                        | Show one task                                      |
| `devflow task start/complete/close/reopen <id>` | Move a task through its lifecycle                  |
| `devflow task delete <id> --yes`                | Delete a task with confirmation                    |
| `devflow start <id>`                            | Create a task branch and start work                |
| `devflow finish <id>`                           | Validate completion readiness                      |

## Git

| Command                              | Purpose                            |
| ------------------------------------ | ---------------------------------- |
| `devflow branch list`                | List local branches                |
| `devflow branch create <name>`       | Create and switch to a branch      |
| `devflow branch switch <name>`       | Switch branches                    |
| `devflow branch delete <name> --yes` | Delete a local branch              |
| `devflow branch cleanup --yes`       | Delete safe merged branches        |
| `devflow git status`                 | Show branch and working tree state |
| `devflow git log`                    | Show recent commits                |
| `devflow git diff`                   | Show unstaged changes              |
| `devflow git fetch/pull/push`        | Sync with remotes                  |
| `devflow git merge/rebase <branch>`  | Integrate another branch           |
| `devflow commit ...`                 | Create a conventional commit       |

## GitHub

GitHub commands require a remote that points to GitHub and `DEVFLOW_GITHUB_TOKEN`.

| Command                                       | Purpose                          |
| --------------------------------------------- | -------------------------------- |
| `devflow auth status`                         | Validate GitHub authentication   |
| `devflow issue list/show/create/close/reopen` | Manage Issues                    |
| `devflow issue link <task> <number>`          | Link an Issue to a task          |
| `devflow pr list/show/create/checkout`        | Manage Pull Requests             |
| `devflow pr approve <number>`                 | Approve a Pull Request           |
| `devflow pr request-changes <number>`         | Request changes                  |
| `devflow pr merge <number> --yes`             | Merge with explicit confirmation |
| `devflow pr close <number> --yes`             | Close with explicit confirmation |
| `devflow review <number>`                     | Show review readiness            |
| `devflow review check <number>`               | Exit non-zero when not ready     |

## Reporting

| Command                       | Purpose                                  |
| ----------------------------- | ---------------------------------------- |
| `devflow status`              | Show current task and Git state          |
| `devflow dashboard`           | Show a project overview                  |
| `devflow doctor`              | Check repository health                  |
| `devflow report`              | Generate Markdown development report     |
| `devflow readme`              | Safely update the DevFlow README section |
| `devflow config list/get/set` | Manage validated settings                |
| `devflow workflow set/show`   | Manage GitFlow or trunk strategy         |

Most read/list commands support the global `--json` option.
