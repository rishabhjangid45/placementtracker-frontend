---
name: Git Commit Formatter
description: Automates staging and committing changes using the Conventional Commits standard. Keeps project history clean, consistent, and easy to parse for changelogs and CI/CD pipelines.
---

# Git Commit Formatter

## Purpose

This skill enforces a standardized Git commit workflow using the **Conventional Commits** specification. Every commit made by the agent must follow a strict format that keeps the project history clean, readable, and compatible with automated changelog generation.

## Activation

This skill activates whenever the agent:
- Is asked to commit changes
- Completes a task and needs to save progress
- Is asked to stage files or create a Git commit
- Finishes implementing a feature, fix, or refactor

## Rules

### Commit Message Format

All commits MUST follow the **Conventional Commits** format:

```
<type>(<scope>): <short description>

[optional body]

[optional footer]
```

### Commit Types

Use ONLY the following commit types:

| Type       | When to Use                                              | Example                                              |
|------------|----------------------------------------------------------|------------------------------------------------------|
| `feat`     | A new feature or functionality                           | `feat(ui): add job tracker kanban board`              |
| `fix`      | A bug fix                                                | `fix(auth): resolve JWT expiration bug`               |
| `docs`     | Documentation-only changes                               | `docs(readme): update setup instructions`             |
| `style`    | Code style changes (formatting, no logic change)         | `style(components): fix indentation in sidebar`       |
| `refactor` | Code refactoring (no feature or fix)                     | `refactor(hooks): simplify useAuth state management`  |
| `test`     | Adding or updating tests                                 | `test(api): add unit tests for job service`           |
| `chore`    | Maintenance tasks (deps, config, build)                  | `chore(deps): upgrade axios to v1.7.0`               |
| `perf`     | Performance improvements                                 | `perf(dashboard): lazy-load chart components`         |
| `ci`       | CI/CD configuration changes                              | `ci(github): add deploy workflow`                     |
| `build`    | Build system or external dependency changes              | `build(vite): update vite config for path aliases`    |
| `revert`   | Reverting a previous commit                              | `revert: revert feat(ui): add job tracker kanban`     |

### Scope Convention

Scopes should reflect the **area of the codebase** affected. Use these standard scopes:

| Scope        | Covers                                    |
|--------------|-------------------------------------------|
| `ui`         | Visual components, pages, layouts         |
| `auth`       | Authentication, login, JWT, sessions      |
| `api`        | API hooks, Axios config, endpoints        |
| `hooks`      | Custom React hooks                        |
| `types`      | TypeScript interfaces and types           |
| `config`     | Configuration files (vite, tsconfig, etc) |
| `deps`       | Dependency additions/updates/removals     |
| `router`     | Routing and navigation                    |
| `components` | Shared/reusable UI components             |
| `utils`      | Utility functions and helpers             |
| `styles`     | Global styles and theme                   |

If no predefined scope fits, use a short, lowercase, descriptive word.

### Description Rules

1. **Use imperative mood** — write "add feature" not "added feature" or "adds feature".
2. **Start with lowercase** — "add job tracker" not "Add job tracker".
3. **No period at the end** — "fix auth redirect" not "fix auth redirect."
4. **Keep it under 72 characters** (type + scope + description combined).
5. **Be specific** — "add kanban board drag-and-drop" not "update UI".

### Commit Body (Optional)

For complex changes, include a body separated by a blank line:

```
feat(ui): add job tracker kanban board

Implement a drag-and-drop kanban board for tracking job applications
across stages: Applied, Phone Screen, Interview, Offer, Rejected.

Uses @dnd-kit for drag interactions and persists state via the
job application API endpoint.
```

### Breaking Changes

If a commit introduces a breaking change, add `BREAKING CHANGE:` in the footer:

```
refactor(api): restructure authentication endpoints

BREAKING CHANGE: /api/v1/login now returns { accessToken, refreshToken }
instead of { token }. Update all consumers accordingly.
```

### Git Workflow Steps

When committing, follow this exact sequence:

```bash
# 1. Check the current status
git status

# 2. Stage relevant files (NEVER use `git add .` blindly)
git add <specific-files>

# 3. Review what's staged
git diff --cached --stat

# 4. Commit with conventional format
git commit -m "<type>(<scope>): <description>"
```

### Rules for Staging

1. **Never** run `git add .` without first reviewing `git status`.
2. **Group related changes** into a single commit. Don't mix unrelated changes.
3. **Never** commit `node_modules/`, `.env` files, or build artifacts.
4. If changes span multiple concerns, create **separate commits** for each:
   - One commit for the feature
   - One commit for the tests
   - One commit for the documentation

### Examples

```bash
# Feature commit
git add src/components/kanban-board.tsx src/hooks/use-jobs.ts
git commit -m "feat(ui): add job tracker kanban board"

# Bug fix commit
git add src/lib/api.ts
git commit -m "fix(auth): resolve JWT expiration bug"

# Dependency update
git add package.json package-lock.json
git commit -m "chore(deps): upgrade react-router to v7"

# Multi-file refactor with body
git add src/hooks/use-auth.ts src/context/auth-context.tsx
git commit -m "refactor(auth): simplify auth state management

Extract token refresh logic into dedicated useTokenRefresh hook
and remove redundant state from AuthContext."
```
