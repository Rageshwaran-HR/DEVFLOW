<div align="center">

# ⚡ DevFlow

### **Developer Workflow Command Center**

_A local-first, production-oriented CLI orchestrating the entire lifecycle from local task creation to Git branches, conventional commits, GitHub Pull Requests, live CI/review checks, and automated development reports._

[![Node.js Version](https://img.shields.io/badge/node-%3E%3D20.0.0-brightgreen.svg?style=for-the-badge&logo=node.js)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Database](https://img.shields.io/badge/Database-SQLite-003B57.svg?style=for-the-badge&logo=sqlite)](https://sqlite.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)
[![Build Status](https://img.shields.io/badge/Build-Passing-success.svg?style=for-the-badge)](<>)

---

</div>

> [!NOTE]
> **Local-First Architecture**: Task states and project metadata are stored locally in `.devflow/devflow.db`. GitHub authentication is optional, operating strictly in runtime memory without storing secret tokens inside your workspace.

---

## ✨ Features at a Glance

| Feature                         | Description                                                                                  |
| :------------------------------ | :------------------------------------------------------------------------------------------- |
| 💾 **SQLite Local Persistence** | Built-in SQLite database engine for zero-overhead local task state tracking.                 |
| 🔄 **Safe Task Lifecycle**      | Enforces structured state transitions (`TODO` → `IN_PROGRESS` → `IN_REVIEW` → `COMPLETED`).  |
| 🌿 **Branch Automation**        | Automates branch creation (`feature/TASK-001-...`), switching, and post-merge cleanup.       |
| 📝 **Conventional Commits**     | Enforces conventional commit standards (`feat`, `fix`, `docs`, `refactor`, `test`, `chore`). |
| 🐙 **GitHub & CI Integration**  | Syncs with GitHub Issues, Pull Requests, live CI checks, and review approvals.               |
| 🩺 **Repository Health Doctor** | Diagnoses branch divergence, uncommitted changes, and project configuration health.          |
| 📊 **Development Reports**      | Generates standalone Markdown reports and updates marked README sections safely.             |

---

## 🛠️ Quick Setup & Installation

### Prerequisites

- **Node.js**: `v20.0.0` or newer
- **npm**: `v10.0.0` or newer

### 1. Clone & Install Dependencies

```bash
# Clone repository
git clone https://github.com/your-username/devflow.git
cd devflow

# Install dependencies using npm
npm install
```

### 2. Build the CLI

```bash
# Compile TypeScript to dist/
npm run devflow:build
```

### 3. (Optional) Link Globally for Direct Terminal Access

To run `devflow` from any directory across your terminal, run `npm link`:

```bash
npm link
```

_Now you can run `devflow` directly from any project folder!_

---

## 🎮 Feature Guide & Commands

> [!TIP]
> All commands can be run either using the global command (`devflow <command>`) or using npm scripts (`npm run devflow -- <command>`).

### 1. Initialize a Project & Health Check

Run `init` inside any repository you want DevFlow to manage:

```bash
# Initialize DevFlow in the current repository
npm run devflow -- init

# Automatically initialize Git & DevFlow if Git is not already created
npm run devflow -- init --yes

# Run a repository health diagnostic check
npm run devflow -- doctor

# Automatically fix repairable health issues
npm run devflow -- doctor --fix
```

---

### 2. Task Lifecycle Management

Manage developer tasks locally without third-party subscriptions:

```bash
# Create a new task
npm run devflow -- task add "Implement user authentication" --priority high --labels auth,api

# List all tasks in local database
npm run devflow -- task list

# Filter tasks by status (TODO, IN_PROGRESS, COMPLETED, CLOSED)
npm run devflow -- task list --status TODO

# Show full details of a specific task
npm run devflow -- task show TASK-001

# Manually complete or reopen a task
npm run devflow -- task complete TASK-001
npm run devflow -- task reopen TASK-001

# Delete a task safely
npm run devflow -- task delete TASK-001 --yes
```

---

### 3. Task-to-Branch Automation

Start working on a task with automatic branch creation:

```bash
# Automatically create feature branch (e.g. feature/TASK-001-implement-user-authentication),
# switch to it, and move task status to IN_PROGRESS
npm run devflow -- start TASK-001

# List all branches and associated tasks
npm run devflow -- branch list

# View active branch & current task association
npm run devflow -- branch show

# Clean up merged local feature branches safely
npm run devflow -- branch cleanup --yes
```

---

### 4. Conventional Commits & Git Control

Enforce clean commit messages across your team:

```bash
# Check working tree status
npm run devflow -- git status

# View current code diff
npm run devflow -- git diff

# Commit changes using Conventional Commits standard
npm run devflow -- commit --type feat --scope auth --message "add login API endpoint" --all

# Push changes to remote repository
npm run devflow -- git push --set-upstream

# Pull & fetch updates
npm run devflow -- git pull
npm run devflow -- git fetch
```

---

### 5. GitHub Issues & Pull Requests

Configure your GitHub environment token to enable live sync:

```bash
# Set your environment variable (PowerShell)
$env:DEVFLOW_GITHUB_TOKEN="ghp_your_personal_access_token"

# Or on Linux / macOS:
export DEVFLOW_GITHUB_TOKEN="ghp_your_personal_access_token"

# Verify authentication status
npm run devflow -- auth status

# GitHub Issues
npm run devflow -- issue list
npm run devflow -- issue create --task TASK-001
npm run devflow -- issue link TASK-001 42

# GitHub Pull Requests
npm run devflow -- pr create --task TASK-001
npm run devflow -- pr list
npm run devflow -- pr show 42
npm run devflow -- pr approve 42

# Inspect PR readiness (verifies passing CI, approval count, mergeability)
npm run devflow -- review check 42

# Merge Pull Request safely
npm run devflow -- pr merge 42 --yes --method squash
```

---

### 6. End-to-End Task Completion (`finish`)

Complete tasks with workflow safety checks:

```bash
# Validate working tree, branch commits, and linked PR before completing task
npm run devflow -- finish TASK-001

# Validate, merge PR, delete local branch, and complete task in one step
npm run devflow -- finish TASK-001 --merge --yes
```

---

### 7. Interactive Dashboard & Development Reports

```bash
# View live project dashboard
npm run devflow -- dashboard

# Display task & Git status
npm run devflow -- status

# Generate a Markdown development report
npm run devflow -- report --output reports/devflow-report.md

# Update marked README section safely (manages <!-- devflow:start --> ... <!-- devflow:end -->)
npm run devflow -- readme
```

---

### 8. Workflow Strategy & Configuration

```bash
# Switch workflow strategy (trunk vs gitflow)
npm run devflow -- workflow set trunk
npm run devflow -- workflow set gitflow

# List configuration settings
npm run devflow -- config list

# Set custom configuration parameters
npm run devflow -- config set branch.prefix feature
npm run devflow -- config set workflow.autoMerge false
```

---

## 🏗️ Architecture & Project Structure

DevFlow is designed with strict domain separation and modularity:

```
DevFlow/
├── src/
│   ├── cli.ts        # Commander CLI registration & command orchestration
│   ├── database.ts   # SQLite schema, persistence, & task repositories
│   ├── git.ts        # Safe Git workflow adapter (simple-git)
│   ├── github.ts     # GitHub API adapter (Octokit)
│   ├── config.ts     # Configuration validation engine
│   ├── doctor.ts     # Health diagnostics check engine
│   ├── markdown.ts   # Markdown report & README generator
│   ├── types.ts      # Domain models & TypeScript definitions
│   └── utils.ts      # Shared UI, formatting, & safety helpers
└── tests/            # Vitest unit & integration test suite
```

---

## 🧪 Development & Quality Scripts

All development operations use standard `npm` scripts:

```bash
# Compile TypeScript CLI
npm run devflow:build

# Run Unit Tests (Vitest)
npm run devflow:test

# Run ESLint check
npm run devflow:lint

# Run Prettier code formatter
npm run devflow:format
```

---

## 📜 License

Distributed under the **MIT License**. See `LICENSE` for more information.
