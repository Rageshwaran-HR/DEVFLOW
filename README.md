<div align="center">

# ⚡ DevFlow

### **Next-Gen Developer Workflow Command Center with Built-In AI Copilot**

_A local-first CLI orchestrating the entire lifecycle from AI feature planning, local task creation, Git branches, conventional commits, GitHub Pull Requests, live CI checks, AI workflow recommendations, and automated changelogs._

[![Node.js Version](https://img.shields.io/badge/node-%3E%3D20.0.0-brightgreen.svg?style=for-the-badge&logo=node.js)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Database](https://img.shields.io/badge/Database-SQLite-003B57.svg?style=for-the-badge&logo=sqlite)](https://sqlite.org)
[![AI Engine](https://img.shields.io/badge/AI%20Copilot-GitHub%20Models-8A2BE2.svg?style=for-the-badge&logo=github)](https://github.com)
[![Build Status](https://img.shields.io/badge/Build-Passing-success.svg?style=for-the-badge)](<>)

---

</div>

> [!NOTE]
> **Local-First Architecture**: Task states and project metadata are stored locally in `.devflow/devflow.db`. GitHub authentication is optional, operating strictly in runtime memory without storing secret tokens inside your workspace.

---

## 🌟 Standout AI & Workflow Features

| Feature                                                  | Description & Value                                                                                                       |
| :------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------ |
| 🤖 **AI Copilot Suite (`devflow ai`)**                   | AI task spec generation, feature plan breakdown, AI conventional commit message generation, and repository quality audit. |
| 💡 **AI Workflow Assistant (`devflow next`)**            | Analyzes git status, uncommitted changes, and active tasks to recommend your exact next CLI step.                         |
| 📑 **Automated Changelog Engine (`devflow changelog`)**  | Parses Conventional Commits and generates clean `CHANGELOG.md` releases grouped by scope.                                 |
| 🔄 **1-Click Multi-Branch GitHub Sync (`devflow sync`)** | Pushes all local feature, dev, qual, and main branches cleanly with a live terminal spinner.                              |
| 💾 **Built-in SQLite Persistence**                       | Tracks tasks locally with zero subscription costs or cloud lock-in (`.devflow/devflow.db`).                               |
| 🌿 **Automated Task-to-Branch Flow (`devflow start`)**   | Creates feature branches, checks them out, and updates task state in a single step.                                       |
| 🩺 **Repository Doctor (`devflow doctor`)**              | Automatically audits repository health, branch divergence, uncommitted changes, and configs.                              |
| 📦 **Stash Management (`devflow stash`)**                | Clean, formatted terminal interface for saving, listing, popping, and dropping stashes.                                   |

---

## 🚀 Quick Start & Installation

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

# 5. Initialize DevFlow inside any Git repository
devflow init --yes
```

---

## 🔑 Environment & GitHub API Setup

GitHub integration is optional. When needed for Issues, Pull Requests, AI Copilot features, and CI checks, configure your GitHub Personal Access Token (`DEVFLOW_GITHUB_TOKEN`).

### How to Get Your GitHub Access Token

1. Log in to [GitHub.com](https://github.com).
2. Go to **Settings** → **Developer settings** → **Personal access tokens** → **Tokens (classic)**.
3. Click **Generate new token (classic)** and select:
   - ✅ **`repo`** (Full control of private repositories)
   - ✅ **`workflow`** (Update GitHub Action workflows)
4. Copy the generated token (`ghp_...`).

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

## 🎮 Complete Structured Command Guide

All commands can be run either globally (`devflow <command>`) or using npm scripts (`npm run devflow -- <command>`).

---

### 1. 🤖 AI Copilot & Workflow Intelligence Suite (`devflow ai` & `devflow next`)

_AI intelligence for task generation, feature breakdown, commit messages, repository audits, and next-step guidance._

```bash
# 1. AI Next-Step Workflow Assistant
devflow next

# 2. AI Task Generation (Generates title, description, priority, and labels from prompt)
devflow ai task "Build real-time WebSocket notification hub"

# 3. AI Feature Breakdown (Breaks down high-level goal into structured subtasks)
devflow ai plan "User authentication and JWT session engine"

# 4. AI Conventional Commit (Analyzes staged diff & generates commit message)
devflow ai commit --all

# 5. AI Repository Quality Audit (Evaluates commit ratio, health, and recommendations)
devflow ai audit
```

<details>
<summary><b>📸 View Sample Terminal Output</b></summary>

```text
DevFlow AI Repository Audit
───────────────────────────────────
Score: 85/100 (Grade A)

DevFlow AI Quality Audit Score: 85/100 (Grade A). Evaluated 35 commits and 15 tasks.

Strengths:
  ✓ Working tree is completely clean
  ✓ High task completion velocity (15/15 tasks completed)
  ✓ Repository is fully in sync with remote GitHub

AI Action Recommendations:
  💡 Improve commit quality: ensure future commits follow Conventional Commits standard
```

</details>

---

### 2. 📝 Task Lifecycle Management (`devflow task`)

_Create, list, inspect, complete, reopen, and delete tasks stored in `.devflow/devflow.db`._

```bash
# Create a task
devflow task add "Implement user authentication" --priority high --labels auth,api --assignee "dev"

# List all tasks
devflow task list

# Filter tasks by status (TODO, IN_PROGRESS, IN_REVIEW, BLOCKED, COMPLETED, CLOSED)
devflow task list --status TODO

# Show task details
devflow task show TASK-001

# Complete or reopen a task
devflow task complete TASK-001
devflow task reopen TASK-001

# Delete a task
devflow task delete TASK-001 --yes
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

### 3. 🌿 Task-to-Branch Automation & Branch Control (`devflow start` & `devflow branch`)

_Automatically create task branches, switch to them, list active branches, and cleanup merged work._

```bash
# Start working on a task (creates branch feature/TASK-001-... & updates task status)
devflow start TASK-001

# List local branches and task associations
devflow branch list

# View current active branch & linked task
devflow branch show

# Clean up merged local branches safely
devflow branch cleanup --yes

# Delete a specific branch
devflow branch delete feature/old-task --yes
```

<details>
<summary><b>📸 View Sample Terminal Output</b></summary>

```text
✓ TASK-001 started on feature/TASK-001-implement-user-authentication

Local Branches
─────────────────────────
* feature/TASK-001-implement-user-authentication (TASK-001)
  main
  dev
  qual
```

</details>

---

### 4. 📦 Conventional Commits, Safe Git & Stashing (`devflow commit`, `devflow git`, `devflow stash`)

_Enforce Conventional Commit standards, execute safe Git operations, and manage local stashes._

```bash
# Conventional Commit
devflow commit --type feat --scope auth --message "add login endpoint" --all

# Working tree status & diff
devflow git status
devflow git diff --staged
devflow git log --count 10

# Push branch / push all
devflow git push --set-upstream
devflow git push-all

# Merge & Rebase
devflow git merge feature/login
devflow git rebase main

# Pull & Fetch
devflow git pull
devflow git fetch

# Manage Stashes
devflow stash save "WIP feature login"
devflow stash list
devflow stash pop
devflow stash apply stash@{0}
devflow stash drop stash@{0}
```

<details>
<summary><b>📸 View Sample Terminal Output</b></summary>

```text
✓ Created commit 7866791e feat(auth): add login endpoint

Git Stashes
─────────────────────────
  stash@{0} WIP feature login
```

</details>

---

### 5. 🔄 1-Click Multi-Branch GitHub Sync (`devflow sync`)

_Pushes all local feature, dev, qual, and main branches cleanly to GitHub._

```bash
devflow sync
```

<details>
<summary><b>📸 View Sample Terminal Output</b></summary>

```text
DevFlow GitHub Sync
───────────────────────────
✓ Pushed 17 branches to GitHub remote
ℹ Remote: https://github.com/Rageshwaran-HR/DEVFLOW.git
  • dev
  • feature/TASK-001-phase-1-project-setup
  • main
  • qual
```

</details>

---

### 6. 📑 Automated Conventional Changelog Generator (`devflow changelog`)

_Generates a Markdown changelog grouped by conventional commit scopes._

```bash
# Output changelog to terminal
devflow changelog

# Save directly to CHANGELOG.md file
devflow changelog --output CHANGELOG.md
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

### 7. 🐙 GitHub Integration: Issues, Pull Requests & Reviews (`devflow issue`, `devflow pr`, `devflow review`)

_Sync local tasks with online GitHub Issues and Pull Requests._

```bash
# Check GitHub Authentication Status
devflow auth status

# GitHub Issues
devflow issue list
devflow issue create --task TASK-001
devflow issue show 42
devflow issue link TASK-001 42
devflow issue close 42
devflow issue reopen 42

# GitHub Pull Requests
devflow pr create --task TASK-001
devflow pr list
devflow pr show 42
devflow pr checkout 42
devflow pr approve 42
devflow pr request-changes 42
devflow pr merge 42 --yes --method squash

# PR Review & CI Readiness Check
devflow review 42
devflow review check 42
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

### 8. 🎯 End-to-End Workflow Finish (`devflow finish`)

_Validates working tree, commits, PR status, and completes task._

```bash
# Guarded validation check before completion
devflow finish TASK-001

# Guarded validation, merge PR, delete feature branch, and complete task
devflow finish TASK-001 --merge --yes
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

### 9. 📊 Dashboard, Reports & Health Doctor (`devflow dashboard`, `devflow doctor`, `devflow report`)

_Live terminal overview, diagnostic doctor, and markdown reports._

```bash
# Interactive live dashboard & status
devflow dashboard
devflow status

# Repository health diagnostics doctor
devflow doctor
devflow doctor --fix

# Development reports & README updater
devflow report --output reports/summary.md
devflow readme
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

### 10. ⚙️ Workflow Strategies & Configuration (`devflow workflow` & `devflow config`)

_Manage branching strategies (`trunk` vs `gitflow`) and local configuration._

```bash
# Workflow Strategy
devflow workflow show
devflow workflow set trunk
devflow workflow set gitflow

# Configuration Values
devflow config list
devflow config get workflow.strategy
devflow config set branch.prefix feature
```

<details>
<summary><b>📸 View Sample Terminal Output</b></summary>

```text
Configuration
─────────────────────────
workflow.strategy             trunk
git.defaultBranch             main
branch.prefix                 feature
```

</details>

---

### 11. 🚀 Repository Initialization (`devflow init`)

_Initialize DevFlow SQLite database & Git repository inside any project._

```bash
# Standard init
devflow init

# Force initialization of Git + DevFlow database automatically
devflow init --yes
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

## 🏗️ Architecture & Project Structure

```
DevFlow/
├── src/
│   ├── ai.ts         # GitHub Copilot & AI Models inference engine
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
