# Workflows

## GitFlow

Select GitFlow when the repository has a long-lived integration branch or release process:

```bash
devflow workflow set gitflow
devflow config set branch.prefix feature
devflow start TASK-001
```

The default branch is detected during `devflow init` and can be changed with `git.defaultBranch`. Feature, bugfix, hotfix, and chore prefixes are supported by configuration.

## Trunk-based development

Trunk-based development is the default:

```bash
devflow workflow set trunk
devflow start TASK-001
```

Branches are expected to be short-lived and are validated before a guarded finish. DevFlow does not force a merge policy on the repository.

## Task to Pull Request

1. Add a task.
2. Start the task to create and checkout a branch.
3. Commit changes with a conventional message.
4. Push the branch.
5. Create a Pull Request. DevFlow infers the branch, target, task, and changed-file summary.
6. Inspect review and CI readiness.
7. Merge only with explicit confirmation.
8. Complete the local task and generate a report.

## Guarded finish

`devflow finish` checks:

- clean working tree
- current branch matches the task branch
- repository has commits
- task has a linked Pull Request

When `--merge --yes` is used, it additionally performs the requested GitHub merge. Automatic merge is disabled by default and is never silently enabled by configuration.
