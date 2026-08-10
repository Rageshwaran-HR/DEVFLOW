# Development

## Setup

```bash
pnpm install
pnpm run devflow:build
```

## Quality checks

```bash
pnpm run devflow:build
pnpm run devflow:lint
pnpm run devflow:format:check
pnpm run devflow:test
```

## Tests

Tests use Vitest and do not require a real GitHub account. The GitHub integration is isolated behind `GitHubClient`, so business logic can be tested without network access.

Temporary SQLite databases are used for persistence tests. Git integration tests can use temporary Git repositories when extending the suite.

## Adding a command

Keep argument parsing and presentation in `src/cli.ts`, but put reusable behavior in an adapter or service module. Use:

- `DevFlowError` for expected user-facing failures
- `--json` for machine-readable output
- explicit `--yes` for destructive actions
- `ConfigManager` for settings validation
- `Database` for local persistence

Avoid shelling out to commands derived from repository content. Use the typed `simple-git` adapter or Node APIs.

## Release checklist

1. Run all quality checks.
2. Confirm `devflow --help` and representative command help output.
3. Test `devflow init` in a temporary repository.
4. Confirm no credentials or `.devflow` databases are committed.
5. Review the GitHub Actions workflow.
