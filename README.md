<div align="center">

# ⚡ DevFlow

### **Next-Gen Developer Workflow Command Center**

_A local-first CLI orchestrating the entire lifecycle from local task creation to Git branches, conventional commits, GitHub Pull Requests, live CI/review checks, AI workflow recommendations, and automated changelogs._

[![Node.js Version](https://img.shields.io/badge/node-%3E%3D20.0.0-brightgreen.svg?style=for-the-badge&logo=node.js)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Database](https://img.shields.io/badge/Database-SQLite-003B57.svg?style=for-the-badge&logo=sqlite)](https://sqlite.org)
[![Build Status](https://img.shields.io/badge/Build-Passing-success.svg?style=for-the-badge)](<>)

---

</div>

> [!NOTE]
> **Local-First Architecture**: Task states and project metadata are stored locally in `.devflow/devflow.db`. GitHub authentication is optional, operating strictly in runtime memory without storing secret tokens inside your workspace.

---

## 🌟 What Makes DevFlow Stand Out?

| Standout Feature                                         | Why It Beats Other Tools                                                                               |
| :------------------------------------------------------- | :----------------------------------------------------------------------------------------------------- |
| 🤖 **AI Workflow Assistant (`devflow next`)**            | Analyzes your current git tree, active tasks, and commits to tell you _the exact command to run next_. |
| 📑 **Automated Changelog Engine (`devflow changelog`)**  | Parses Conventional Commits and generates clean `CHANGELOG.md` releases grouped by scope.              |
| 🔄 **1-Click Multi-Branch GitHub Sync (`devflow sync`)** | Pushes all local feature, dev, qual, and main branches cleanly with a live terminal spinner.           |
| 💾 **Built-in SQLite Persistence**                       | Tracks tasks locally with zero subscription costs or cloud lock-in (`.devflow/devflow.db`).            |
| 🌿 **Automated Task-to-Branch Flow (`devflow start`)**   | Creates feature branches, checks them out, and updates task state in a single step.                    |
| 🩺 **Repository Doctor (`devflow doctor`)**              | Automatically audits repository health, branch divergence, uncommitted changes, and configs.           |
| 📦 **Stash Management (`devflow stash`)**                | Clean, formatted terminal interface for saving, listing, popping, and dropping stashes.                |

---

## 🔑 Environment & GitHub API Setup

GitHub integration is optional. When needed for Issues, Pull Requests, and CI checks, configure your GitHub Personal Access Token (`DEVFLOW_GITHUB_TOKEN`).

### Step-by-Step: How to Get Your GitHub Access Token

1. Log in to [GitHub.com](https://github.com).
2. Click your profile picture in the top-right → **Settings**.
3. Scroll down the left sidebar and click **Developer settings**.
4. Select **Personal access tokens** → **Tokens (classic)**.
5. Click **Generate new token (classic)**.
6. Select the permissions:
   - ✅ **`repo`** (Full control of private repositories)
   - ✅ **`workflow`** (Update GitHub Action workflows)
7. Click **Generate token** and copy the generated token (`ghp_...`).

### How to Set the Environment Variable

#### Windows PowerShell:

```powershell
$env:DEVFLOW_GITHUB_TOKEN="ghp_your_copied_token_here"
```

#### macOS / Linux Bash or Zsh:

```bash
export DEVFLOW_GITHUB_TOKEN="ghp_your_copied_token_here"
```

---

## 🛠️ Quick Setup & Installation

```bash
# 1. Clone repository
git clone https://github.com/Rageshwaran-HR/DEVFLOW.git
cd DEVFLOW

# 2. Install dependencies
npm install

# 3. Build TypeScript CLI
npm run devflow:build

# 4. Link CLI globally (run 'devflow' from anywhere!)
npm link
```

---

## 🎮 Complete Master Command Guide (All Commands Included)

All commands can be run either globally (`devflow <command>`) or using npm scripts (`npm run devflow -- <command>`).

---

### 1. 🤖 AI Workflow Assistant (`devflow next`)

_Analyzes git state, uncommitted changes, and database tasks to tell you what to do next._

```bash
npm run devflow -- next
```

<details>
<summary><b>📸 View Sample Terminal Output</b></summary>

```text
DevFlow AI Workflow Assistant
─────────────────────────────────────
ℹ Detected 2 uncommitted changes on branch 'feature/TASK-001'.

💡 Recommended Next Step:
   devflow commit --type feat --message "your commit description" --all
```

</details>

---

### 2. 📑 Automated Conventional Changelog Generator (`devflow changelog`)

_Generates a Markdown changelog grouped by conventional commit scopes._

```bash
# Print to terminal
npm run devflow -- changelog

# Save directly to CHANGELOG.md file
npm run devflow -- changelog --output CHANGELOG.md
```

<details>
<summary><b>📸 View Sample Terminal Output</b></summary>

```text
# Changelog

Generated on 2026-08-11

## Features

- **auth**: add login API endpoint (`7866791`)
- **ui**: add dark mode toggle (`5a29126`)

## Documentation

- **docs**: update API command reference (`c2ae519`)
```

</details>

---

### 3. 🔄 1-Click Multi-Branch GitHub Sync (`devflow sync`)

_Pushes all local feature, dev, qual, and main branches cleanly to GitHub._

```bash
npm run devflow -- sync
```

<details>
<summary><b>📸 View Sample Terminal Output</b></summary>

```text
DevFlow GitHub Sync
───────────────────────────
✓ Pushed 15 branches to GitHub remote
ℹ Remote: https://github.com/Rageshwaran-HR/DEVFLOW.git
  • dev
  • feature/TASK-001-phase-1-project-setup
  • main
  • qual
```

</details>

---

### 4. 🚀 Project Initialization (`devflow init`)

_Initializes DevFlow SQLite database & Git repository._

```bash
# Standard init
npm run devflow -- init

# Force initialization of Git + DevFlow database
npm run devflow -- init --yes
```

<details>
<summary><b>📸 View Sample Terminal Output</b></summary>

```text
DevFlow Initialization
──────────────────────────────
✓ Git repository detected
✓ Remote detected
✓ Database initialized

Project: DEVFLOW
Remote: https://github.com/Rageshwaran-HR/DEVFLOW.git
Default branch: main

✓ DevFlow initialized successfully.
```

</details>

---

### 5. 📝 Task Lifecycle Management (`devflow task`)

_Manage tasks stored locally in `.devflow/devflow.db`._

```bash
# Create a task
npm run devflow -- task add "Implement user authentication" --priority high --labels auth,api --assignee "dev"

# List all tasks
npm run devflow -- task list

# Filter tasks by status (TODO, IN_PROGRESS, IN_REVIEW, BLOCKED, COMPLETED, CLOSED)
npm run devflow -- task list --status TODO

# Show task details
npm run devflow -- task show TASK-001

# Complete or reopen a task
npm run devflow -- task complete TASK-001
npm run devflow -- task reopen TASK-001

# Delete a task
npm run devflow -- task delete TASK-001 --yes
```

<details>
<summary><b>📸 View Sample Terminal Output</b></summary>

```text
Task Overview
─────────────────────────
ID          TASK-001
Status      IN_PROGRESS
Priority    HIGH
Title       Implement user authentication
Branch      feature/TASK-001-implement-user-authentication
Created     2026-08-11T00:15:00.000Z
```

</details>

---

### 6. 🌿 Task-to-Branch Automation (`devflow start`)

_Creates feature branch, switches to it, and updates task state to IN_PROGRESS._

```bash
npm run devflow -- start TASK-001
```

<details>
<summary><b>📸 View Sample Terminal Output</b></summary>

```text
✓ TASK-001 started on feature/TASK-001-implement-user-authentication
```

</details>

---

### 7. 🌿 Branch Management (`devflow branch`)

_Manage local branches & cleanup merged work._

```bash
# List local branches and task associations
npm run devflow -- branch list

# Show active branch & linked task
npm run devflow -- branch show

# Clean up merged local branches safely
npm run devflow -- branch cleanup --yes

# Delete a specific branch
npm run devflow -- branch delete feature/old-task --yes
```

<details>
<summary><b>📸 View Sample Terminal Output</b></summary>

```text
Local Branches
─────────────────────────
* feature/TASK-001-implement-user-authentication (TASK-001)
  main
  dev
  qual
```

</details>

---

### 8. 📝 Conventional Commits (`devflow commit`)

_Enforce Conventional Commit standard (`feat`, `fix`, `docs`, `refactor`, `test`, `chore`)._

```bash
npm run devflow -- commit --type feat --scope auth --message "add login endpoint" --all
```

<details>
<summary><b>📸 View Sample Terminal Output</b></summary>

```text
✓ Created commit 7866791e feat(auth): add login endpoint
```

</details>

---

### 9. 📦 Safe Git Operations (`devflow git`)

_Safe Git commands with formatted outputs._

```bash
# Working tree status
npm run devflow -- git status

# View code diff
npm run devflow -- git diff
npm run devflow -- git diff --staged

# View commit log
npm run devflow -- git log --count 10

# Push branch / push all
npm run devflow -- git push --set-upstream
npm run devflow -- git push-all

# Merge branch with conflict reports
npm run devflow -- git merge feature/login

# Rebase branch
npm run devflow -- git rebase main

# Pull & Fetch
npm run devflow -- git pull
npm run devflow -- git fetch
```

<details>
<summary><b>📸 View Sample Terminal Output</b></summary>

```text
main changes pending · 2 ahead · 0 behind

Conflicting files:
  ✖ src/database.ts

Suggested action: Resolve conflicts in the files listed above, stage them with `devflow git add`, and run `devflow commit`.
```

</details>

---

### 10. 📦 Stash Management (`devflow stash`)

_Save, list, pop, apply, and drop local stashes._

```bash
# Save uncommitted work to stash
npm run devflow -- stash save "WIP feature login"

# List stashes
npm run devflow -- stash list

# Pop top stash
npm run devflow -- stash pop

# Apply stash without removing it
npm run devflow -- stash apply stash@{0}

# Drop stash
npm run devflow -- stash drop stash@{0}
```

<details>
<summary><b>📸 View Sample Terminal Output</b></summary>

```text
Git Stashes
─────────────────────────
  stash@{0} WIP feature login
```

</details>

---

### 11. 🐙 GitHub Authentication (`devflow auth`)

_Check GitHub API authentication._

```bash
npm run devflow -- auth status
```

<details>
<summary><b>📸 View Sample Terminal Output</b></summary>

```text
GitHub Authentication Status
────────────────────────────────────
✓ Token configured in environment
✓ Authenticated as: Rageshwaran-HR
```

</details>

---

### 12. 🐛 GitHub Issues Sync (`devflow issue`)

_Sync local tasks with online GitHub Issues._

```bash
# List GitHub issues
npm run devflow -- issue list

# Create GitHub issue from local task
npm run devflow -- issue create --task TASK-001

# View specific issue
npm run devflow -- issue show 42

# Link local task to issue
npm run devflow -- issue link TASK-001 42

# Close / Reopen issue
npm run devflow -- issue close 42
npm run devflow -- issue reopen 42
```

<details>
<summary><b>📸 View Sample Terminal Output</b></summary>

```text
GitHub Issues
─────────────────────────
#42  open  Implement user authentication (TASK-001)
```

</details>

---

### 13. 🔀 GitHub Pull Requests (`devflow pr`)

_Create, view, approve, and merge Pull Requests._

```bash
# Create Pull Request from current branch & task
npm run devflow -- pr create --task TASK-001

# List open PRs
npm run devflow -- pr list

# Show PR status & CI details
npm run devflow -- pr show 42

# Checkout PR branch locally
npm run devflow -- pr checkout 42

# Approve PR or request changes
npm run devflow -- pr approve 42
npm run devflow -- pr request-changes 42

# Merge PR safely
npm run devflow -- pr merge 42 --yes --method squash
```

<details>
<summary><b>📸 View Sample Terminal Output</b></summary>

```text
Pull Request #42
─────────────────────────
Title       Implement user authentication
State       open
Head        feature/TASK-001-implement-user-authentication
Base        main
URL         https://github.com/Rageshwaran-HR/DEVFLOW/pull/42
```

</details>

---

### 14. 🔍 PR Review & CI Check (`devflow review`)

_Inspect PR review approvals & CI status._

```bash
# Inspect review status
npm run devflow -- review 42

# Exit zero if PR is approved, mergeable, & CI passing (used in scripts)
npm run devflow -- review check 42
```

<details>
<summary><b>📸 View Sample Terminal Output</b></summary>

```text
PR #42 Review Readiness
────────────────────────────────
✓ State is OPEN
✓ Branch is MERGEABLE
✓ CI checks PASSING
✓ Approved by 1 reviewer
```

</details>

---

### 15. 🎯 End-to-End Workflow Finish (`devflow finish`)

_Validates working tree, commits, PR status, and completes task._

```bash
# Guarded validation check before completion
npm run devflow -- finish TASK-001

# Guarded validation, merge PR, delete feature branch, and complete task
npm run devflow -- finish TASK-001 --merge --yes
```

<details>
<summary><b>📸 View Sample Terminal Output</b></summary>

```text
✓ Working tree clean
✓ Branch verified
✓ Pull Request #42 merged
✓ Feature branch cleaned up
✓ TASK-001 marked COMPLETED
```

</details>

---

### 16. 📊 Dashboard & Status (`devflow dashboard` & `devflow status`)

_Live terminal overview & task state._

```bash
# Interactive dashboard
npm run devflow -- dashboard

# Status overview
npm run devflow -- status
npm run devflow -- status --json
```

<details>
<summary><b>📸 View Sample Terminal Output</b></summary>

```text
DevFlow Dashboard
─────────────────────────
Project       DEVFLOW
Workflow      trunk
Branch        main
Git           clean
Open tasks    1
Review queue  0

Recent tasks
TASK-001   IN_PROGRESS  Implement user authentication
```

</details>

---

### 17. 🩺 Repository Health Doctor (`devflow doctor`)

_Diagnostic suite for repository health._

```bash
npm run devflow -- doctor
npm run devflow -- doctor --fix
```

<details>
<summary><b>📸 View Sample Terminal Output</b></summary>

```text
Repository Doctor
─────────────────────────
✓ Git repository           Repository detected
✓ Remote                   https://github.com/Rageshwaran-HR/DEVFLOW.git
✓ Current branch           main
✓ README                   README.md present
✓ .gitignore               .gitignore present
✓ TypeScript configuration tsconfig.json present
```

</details>

---

### 18. 📈 Development Reports & README Updater (`devflow report` & `devflow readme`)

_Generate markdown summaries and manage README sections._

```bash
# Generate development report
npm run devflow -- report
npm run devflow -- report --output reports/devflow-report.md

# Update marked section in README (manages <!-- devflow:start --> ... <!-- devflow:end -->)
npm run devflow -- readme
```

<details>
<summary><b>📸 View Sample Terminal Output</b></summary>

```text
✓ Written report to D:\DEVFLOW\reports\devflow-report.md
```

</details>

---

### 19. ⚙️ Workflow Strategies (`devflow workflow`)

_Configure branching strategies (`trunk` vs `gitflow`)._

```bash
# Show current workflow strategy
npm run devflow -- workflow show

# Set workflow strategy
npm run devflow -- workflow set trunk
npm run devflow -- workflow set gitflow
```

<details>
<summary><b>📸 View Sample Terminal Output</b></summary>

```text
Strategy: trunk
Default branch: main
Branch prefix: feature
```

</details>

---

### 20. ⚙️ DevFlow Configuration (`devflow config`)

_Manage local configuration values._

```bash
# List config values
npm run devflow -- config list

# Get specific key
npm run devflow -- config get workflow.strategy

# Set config key
npm run devflow -- config set branch.prefix feature
npm run devflow -- config set workflow.autoMerge false
```

<details>
<summary><b>📸 View Sample Terminal Output</b></summary>

```text
Configuration
─────────────────────────
workflow.strategy             trunk
git.defaultBranch             main
branch.prefix                 feature
github.autoLinkIssues         true
github.autoCreatePR           true
```

</details>

---

## 🏗️ Architecture & Project Structure

```
DevFlow/
├── src/
│   ├── cli.ts        # Commander CLI registration & AI assistant orchestration
│   ├── database.ts   # SQLite schema & task persistence repository
│   ├── git.ts        # Safe Git workflow & stash adapter
│   ├── github.ts     # Octokit GitHub API integration
│   ├── config.ts     # Configuration validation engine
│   ├── doctor.ts     # Repository health diagnostics engine
│   ├── markdown.ts   # Markdown report & changelog generator
│   ├── types.ts      # TypeScript interfaces & domain types
│   └── utils.ts      # Shared UI formatting & safety helpers
└── tests/            # Vitest unit test suite (11/11 tests pass)
```

---

## 🧪 Development & Quality Commands

```bash
# Build TypeScript CLI
npm run devflow:build

# Run Vitest Unit Tests
npm run devflow:test

# Run ESLint Check
npm run devflow:lint

# Format Codebase with Prettier
npm run devflow:format
```
