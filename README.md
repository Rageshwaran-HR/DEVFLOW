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

DevFlow goes far beyond standard Git wrappers. It is designed to be the ultimate terminal developer companion:

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
4. Select **Personal access tokens** → **Tokens (classic)** (or Fine-grained tokens).
5. Click **Generate new token (classic)**.
6. Give it a descriptive Note (e.g. `DevFlow CLI Token`).
7. Select the following permissions:
   - ✅ **`repo`** (Full control of private repositories)
   - ✅ **`workflow`** (Update GitHub Action workflows)
8. Click **Generate token** and copy the generated token (`ghp_...`).

### How to Set the Environment Variable

#### In Windows PowerShell:

```powershell
$env:DEVFLOW_GITHUB_TOKEN="ghp_your_copied_token_here"
```

#### In macOS / Linux Bash or Zsh:

```bash
export DEVFLOW_GITHUB_TOKEN="ghp_your_copied_token_here"
```

#### Verification:

```bash
devflow auth status
```

---

## 🛠️ Quick Setup & Installation

### Prerequisites

- **Node.js**: `v20.0.0` or newer
- **npm**: `v10.0.0` or newer

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

## 🎮 Complete Command Guide & Sample Outputs

---

### 1. 🤖 AI Workflow Next-Step Assistant (`devflow next`)

_Analyzes your git tree and database state to recommend your next command._

```bash
npm run devflow -- next
# Or: devflow next
```

<details>
<summary><b>📸 View Sample Terminal Output</b></summary>

```text
DevFlow AI Workflow Assistant
─────────────────────────────────────
ℹ Detected 2 uncommitted changes on branch 'feature/TASK-001'.

💡 Recommended Next Step:
   devflow commit --type feat --message "add user login endpoint" --all
```

</details>

---

### 2. 📑 Automated Changelog Generator (`devflow changelog`)

_Parses Conventional Commits and builds a grouped Markdown changelog._

```bash
# Output changelog to terminal
npm run devflow -- changelog

# Save directly to CHANGELOG.md
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

### 3. 🚀 1-Click GitHub Multi-Branch Sync (`devflow sync`)

_Pushes all branches (`main`, `qual`, `dev`, `feature/*`) cleanly to GitHub._

```bash
npm run devflow -- sync
# Or: devflow sync
```

<details>
<summary><b>📸 View Sample Terminal Output</b></summary>

```text
DevFlow GitHub Sync
───────────────────────────
✓ Pushed 14 branches to GitHub remote
ℹ Remote: https://github.com/Rageshwaran-HR/DEVFLOW.git
  • dev
  • feature/TASK-001-phase-1-project-setup
  • feature/TASK-002-phase-2-task-management
  • main
  • qual
```

</details>

---

### 4. 🚀 Project Initialization & Health Doctor (`devflow doctor`)

_Audits project configuration, Git health, and uncommitted files._

```bash
# Initialize DevFlow in current repo
npm run devflow -- init --yes

# Run health diagnostics
npm run devflow -- doctor
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

### 5. 📝 Local Task Lifecycle Management (`devflow task`)

_Manage tasks locally stored in `.devflow/devflow.db`._

```bash
# Create a task
npm run devflow -- task add "Add rate limiting middleware" --priority high

# List tasks
npm run devflow -- task list

# Show task details
npm run devflow -- task show TASK-001
```

<details>
<summary><b>📸 View Sample Terminal Output</b></summary>

```text
Task Overview
─────────────────────────
ID          TASK-001
Status      IN_PROGRESS
Priority    HIGH
Title       Add rate limiting middleware
Branch      feature/TASK-001-add-rate-limiting-middleware
Created     2026-08-11T00:15:00.000Z
```

</details>

---

### 6. 🌿 Task-to-Branch Automation (`devflow start`)

_Creates a feature branch and updates task status in a single step._

```bash
npm run devflow -- start TASK-001
```

<details>
<summary><b>📸 View Sample Terminal Output</b></summary>

```text
✓ TASK-001 started on feature/TASK-001-add-rate-limiting-middleware
```

</details>

---

### 7. 📦 Conventional Commits & Stashes (`devflow commit` & `devflow stash`)

_Enforce clean commit messages and manage local stashes._

```bash
# Conventional Commit
npm run devflow -- commit --type feat --scope api --message "add rate limiter" --all

# Save Stash
npm run devflow -- stash save "WIP rate limiter"

# List Stashes
npm run devflow -- stash list

# Pop Stash
npm run devflow -- stash pop
```

<details>
<summary><b>📸 View Sample Terminal Output</b></summary>

```text
✓ Created commit 3d4fda84 feat(api): add rate limiter

Git Stashes
─────────────────────────
  stash@{0} WIP rate limiter
```

</details>

---

### 8. 📊 Live Interactive Dashboard (`devflow dashboard`)

_Renders a live terminal project overview._

```bash
npm run devflow -- dashboard
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
TASK-001   IN_PROGRESS  Add rate limiting middleware
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
