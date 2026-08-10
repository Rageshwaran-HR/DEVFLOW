# Architecture

## Boundaries

DevFlow is a CLI application with a local-first core:

1. Commander parses arguments and delegates to services/adapters.
2. `ConfigManager` owns validated `.devflow/config.json` settings.
3. `Database` owns the SQLite schema and persistence of local project, task, branch, issue, Pull Request, commit, and configuration records.
4. `GitManager` wraps `simple-git`; no command file shells out to arbitrary repository content.
5. `GitHubClient` wraps Octokit and is created only for an explicit GitHub operation.
6. Markdown generation is pure and writes only requested output files.

## Persistence

The SQLite database is located at `.devflow/devflow.db`. The schema contains:

- `projects`: repository identity and workflow settings
- `tasks`: task lifecycle and links to branches, Issues, and Pull Requests
- `branches`: locally associated branch metadata
- `issues`: minimal Issue identity and state
- `pull_requests`: minimal Pull Request identity and branch relationship
- `commits`: reserved local commit tracking table
- `configuration`: a database mirror of validated config values

GitHub is not treated as a cache of all remote data. PR review and CI details are fetched live so readiness decisions do not use stale snapshots.

## Safety rules

- Token values are read from `DEVFLOW_GITHUB_TOKEN` and are never persisted.
- Destructive operations require `--yes`.
- DevFlow does not force-push or hard-reset.
- README updates use explicit markers and preserve all unrelated content.
- Git branch names are validated before creation.
- GitHub repository identity is inferred from the configured remote rather than hardcoded.

## Error handling

Expected failures use `DevFlowError`, which contains a developer-facing message, optional suggested action, and exit code. The entry point formats these consistently for terminal users.

## Compatibility

Node.js 24 provides the built-in `node:sqlite` API used for local storage. The rest of the application uses TypeScript, ESM, Commander, simple-git, Octokit, Zod, Vitest, ESLint, and Prettier.
