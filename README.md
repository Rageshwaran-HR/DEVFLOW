<div align="center">

# ⚡ DevFlow

### **Next-Gen Developer Workflow Command Center with Built-In AI Copilot**

_A production-ready npm CLI orchestrating the entire lifecycle from AI feature planning, local task creation, Git branches, conventional commits, GitHub Pull Requests, live CI checks, AI workflow recommendations, and automated changelogs._

[![npm Version](https://img.shields.io/npm/v/devflow.svg?style=for-the-badge&logo=npm)](https://www.npmjs.com)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D20.0.0-brightgreen.svg?style=for-the-badge&logo=node.js)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Database](https://img.shields.io/badge/Database-SQLite-003B57.svg?style=for-the-badge&logo=sqlite)](https://sqlite.org)
[![AI Engine](https://img.shields.io/badge/AI%20Copilot-GitHub%20Models-8A2BE2.svg?style=for-the-badge&logo=github)](https://github.com)
[![Build Status](https://img.shields.io/badge/Build-Passing-success.svg?style=for-the-badge)](<>)

---

</div>

> [!NOTE]
> **Local-First & Isolated Architecture**: Project state and tasks are stored locally inside `<your-project>/.devflow/devflow.db`. Global npm installations NEVER share databases or pollute root directories across different projects.

---

## 💻 Installation

Install DevFlow globally via npm:

```bash
npm install -g devflow
# Or scoped: npm install -g @rageshwaran/devflow
```

Verify installation:

```bash
devflow --version
devflow --help
```

---

## ⚡ Quick Start (Global CLI)

```bash
# 1. Navigate to your project directory
cd my-app

# 2. Initialize DevFlow (detects Git repository & sets up local .devflow state)
devflow init

# 3. Add your first development task
devflow task add "Implement user authentication" --priority high

# 4. Start work (creates branch feature/TASK-001-implement-user-authentication)
devflow start TASK-001

# 5. Check AI recommended next step
devflow next

# 6. Commit work with Conventional Commits (or AI auto-commit)
devflow commit --type feat --scope auth --message "add login endpoint" --all

# 7. Complete task
devflow finish TASK-001
```

---

## 🚀 NPX Usage (Without Global Installation)

Run DevFlow instantly in any directory without permanent global installation:

```bash
# Initialize project
npx devflow init

# Check repository health
npx devflow doctor

# Get AI next step guidance
npx devflow next

# Run AI quality & risk audit across repository
npx devflow ai audit --repo
```

---

## 🌟 Standout AI & Workflow Features

| Feature                                                  | Description & Value                                                                                                       |
| :------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------ |
| 🤖 **AI Copilot Suite (`devflow ai`)**                   | AI task spec generation, feature plan breakdown, AI conventional commit message generation, and repository quality audit. |
| 💡 **AI Workflow Assistant (`devflow next`)**            | Analyzes git status, uncommitted changes, and active tasks to recommend your exact next CLI step.                         |
| 📑 **Automated Changelog Engine (`devflow changelog`)**  | Parses Conventional Commits and generates clean `CHANGELOG.md` releases grouped by scope.                                 |
| 🔄 **1-Click Multi-Branch GitHub Sync (`devflow sync`)** | Pushes all local feature, dev, qual, and main branches cleanly with a live terminal spinner.                              |
| 💾 **Built-in SQLite Persistence**                       | Tracks tasks locally with zero subscription costs or cloud lock-in (`<project>/.devflow/devflow.db`).                     |
| 🌿 **Automated Task-to-Branch Flow (`devflow start`)**   | Creates feature branches, checks them out, and updates task state in a single step.                                       |
| 🩺 **Repository Doctor (`devflow doctor`)**              | Automatically audits repository health, branch divergence, uncommitted changes, and configs.                              |
| 📦 **Stash Management (`devflow stash`)**                | Clean, formatted terminal interface for saving, listing, popping, and dropping stashes.                                   |

---

## 🔑 Environment & GitHub API Setup

GitHub integration is optional. Local Git tasks, SQLite persistence, and heuristic AI functions work 100% offline without any API keys.

When GitHub Issues, Pull Requests, live CI checks, and online GitHub AI Copilot models are needed, configure your GitHub Personal Access Token (`DEVFLOW_GITHUB_TOKEN`).

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

---

### 1. 🤖 AI Copilot Suite (`devflow ai` & `devflow next`)

```bash
# 1. AI Next-Step Workflow Assistant
devflow next

# 2. AI Task Generation (Generates title, description, priority, and labels from prompt)
devflow ai task "Build real-time WebSocket notification hub"

# 3. AI Feature Breakdown (Breaks down high-level goal into structured subtasks)
devflow ai plan "User authentication and JWT session engine"

# 4. AI Conventional Commit (Analyzes staged diff & generates commit message)
devflow ai commit --all

# 5. AI Quality & Risk Audit (Audits current branch, specific branch, or whole repo)
devflow ai audit                         # Audit current branch
devflow ai audit --branch feature/login  # Audit specific branch
devflow ai audit --repo                  # Audit all branches in whole repository
devflow ai audit --repo -o report.md    # Save Markdown audit report file
```

<details>
<summary><b>📸 View Sample Terminal Output</b></summary>

```text
DevFlow AI Quality & Risk Audit [Whole Repository (19 local branches)]
────────────────────────────────────────────────────────────────────────
Score: 85/100 (Grade A) | Target: Whole Repository (19 local branches)

DevFlow AI Audit for Whole Repository: Score 85/100 (Grade A). Evaluated 43 commit(s), 0 issue(s) flagged.

Strengths:
  ✓ Tracking 16 active feature branch(es)
  ✓ High task completion velocity (16/20 tasks completed)
  ✓ Repository is fully in sync with remote GitHub

AI Action Recommendations:
  💡 Improve commit quality: ensure future commits follow Conventional Commits standard
```

</details>

---

### 2. 📝 Task Lifecycle Management (`devflow task`)

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

---

### 3. 🌿 Task-to-Branch Automation & Branch Control (`devflow start` & `devflow branch`)

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

---

### 4. 📦 Conventional Commits, Safe Git & Stashing (`devflow commit`, `devflow git`, `devflow stash`)

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

---

### 5. 🔄 1-Click Multi-Branch GitHub Sync (`devflow sync`)

```bash
devflow sync
```

---

### 6. 📑 Automated Conventional Changelog Generator (`devflow changelog`)

```bash
# Output changelog to terminal
devflow changelog

# Save directly to CHANGELOG.md file
devflow changelog --output CHANGELOG.md
```

---

### 7. 🐙 GitHub Integration: Issues, Pull Requests & Reviews (`devflow issue`, `devflow pr`, `devflow review`)

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

---

### 8. 🎯 End-to-End Workflow Finish (`devflow finish`)

```bash
# Guarded validation check before completion
devflow finish TASK-001

# Guarded validation, merge PR, delete feature branch, and complete task
devflow finish TASK-001 --merge --yes
```

---

### 9. 📊 Dashboard, Reports & Health Doctor (`devflow dashboard`, `devflow doctor`, `devflow report`)

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

---

### 10. ⚙️ Workflow Strategies & Configuration (`devflow workflow` & `devflow config`)

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

---

### 11. 🚀 Repository Initialization (`devflow init`)

```bash
# Standard init
devflow init

# Force initialization of Git + DevFlow database automatically
devflow init --yes
```

---

## 🏗️ Architecture & Project Structure

```
DevFlow/
├── bin/              # Package binary entry points
├── dist/             # Compiled JavaScript distribution
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

## 🧪 Development & Testing Guide

For contributors working on DevFlow locally:

```bash
# 1. Clone repository
git clone https://github.com/Rageshwaran-HR/DEVFLOW.git
cd DEVFLOW

# 2. Install dependencies
npm install

# 3. Build CLI
npm run build

# 4. Run Vitest Unit Tests
npm test

# 5. Run ESLint Check & Prettier Format
npm run lint
npm run format
```

---

## 📦 Maintainer Publishing Guide

Steps for package maintainers to inspect and publish releases:

```bash
# 1. Ensure clean build & passing tests
npm run build
npm test

# 2. Test tarball contents without publishing
npm pack --dry-run

# 3. Generate npm tarball package
npm pack

# 4. Test tarball globally on a local machine
npm install -g ./devflow-0.1.0.tgz

# 5. Publish to npm registry (maintainers only)
npm login
npm publish --access public
```
