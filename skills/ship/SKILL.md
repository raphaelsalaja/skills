---
name: ship
description: Commits, pushes, merges and releases a change, watches the checks and confirms it is live.
disable-model-invocation: true
---

# Ship

This skill takes finished work from the working tree to production. It commits in small pieces, pushes, merges, watches checks and confirms the result is live.

## Push means push

When the user says push, ship or merge, do every step to the end. Handing a command back to the user is a finding unless it needs their credentials or their approval. A secret in a commit is always `HIGH`.

Checking the change itself runs in `verify` before this skill starts.

## 1. Check the tree

Run `git status` and read every changed file. Name any file you did not change in this task and ask before committing it. Stage files by name with `git add <path>`, never `git add -A` or `git add .`, then read `git diff --cached`. Committing a stray file is `ship-flag-stray-files`.

Search the staged diff for keys, tokens, passwords and `.env` files. Patterns such as `AKIA[0-9A-Z]{16}`, `gh[pousr]_[A-Za-z0-9]{36}`, `sk_live_` and `-----BEGIN [A-Z ]*PRIVATE KEY-----` catch the common ones. A committed secret is `ship-no-secrets`. A secret that was already pushed is compromised, so rotate it first and remove it second.

## 2. Commit per change

Make one commit per logical change. One commit for a feature, a fix and a rename is `ship-commit-per-change`.

Read `git log --oneline -20` first and reuse the scopes the repository already uses. Write every message as a Conventional Commit: `type(scope): summary` in the imperative, lowercase and with no full stop. Use `feat`, `fix`, `docs`, `refactor`, `perf`, `test`, `build`, `ci` or `chore`. Keep the subject under 72 characters and explain why in the body when the diff cannot show it. Mark a breaking change with `!` after the type and a `BREAKING CHANGE:` footer. A message like "Remove the archive." is `ship-conventional-commits`.

A `.changeset/config.json` means the repository releases with changesets. Add `.changeset/<name>.md` with each changed package and its bump in the same commit: `patch` for a fix, `minor` for a feature and `major` for a break. A package change that releases nothing takes an empty changeset from `changeset --empty`. Private packages need none. A release-bound change with no changeset is `ship-changeset-for-packages`.

## 3. Keep history and hooks intact

Never force-push the default branch or a branch someone else pushed to. On your own branch, use `--force-with-lease`, never `--force`. Never run `git reset --hard`, `git checkout -- .`, `git clean -fd` or `git stash drop` over changes you did not make. Any of these is `ship-no-history-rewrite`.

When a hook or a check fails, fix the cause. `--no-verify`, `HUSKY=0`, `gh pr merge --admin` and `continue-on-error: true` added to pass are `ship-no-bypass`.

## 4. Push, merge and tidy

Push the branch. When asked to merge, merge it, delete the branch and switch back to the default branch. A merged branch left behind is `ship-merge-and-tidy`. Open one pull request per bug or feature. A pull request bundling three fixes is `ship-one-pr-per-bug`.

The description says what changed, why and how it was checked. Put a closing keyword such as `Fixes #123` in it, so merging into the default branch closes the issue. A description that reads "fix bug" is `ship-describe-the-pr`. When the repository squash-merges, the title becomes the commit, so it takes the Conventional Commit form too.

A pull request that changes UI carries a screenshot. That is `ship-screenshot-ui-prs`.

## 5. Watch the checks

Wait for CI and fix what fails. `gh pr checks --watch --fail-fast` waits on a pull request, and `gh run watch` on a push with none. Reporting "pushed" while checks are red or still running is `ship-watch-checks`.

## 6. Close the loop

When the change fixes an issue, link it, close it and reply where it was raised. A fixed bug with its issue left open is `ship-close-the-loop`. When the change deploys, open the live URL or the published version and check it. "Deployed" with no look at production is `ship-confirm-live`.

## 7. Hand back only what needs the user

Do every step you can run yourself. Ask only for a login, a two-factor code or an approval. Say exactly which. A list of commands for the user to run is `ship-do-the-steps`.

## The pair

Every check is a pair. The broken line sits beside the line that replaces it.

| Rule | Broken | Replacement |
| --- | --- | --- |
| `ship-flag-stray-files` | `git add -A` with someone else's file in the tree | Files staged by name, the stray one named, then a question |
| `ship-no-secrets` | `.env.local` committed | `.env.local` ignored, the secret flagged for rotation |
| `ship-commit-per-change` | One commit for a feature, a fix and a rename | Three commits, one per change |
| `ship-conventional-commits` | `Remove the archive.` | `chore: remove the archive` |
| `ship-changeset-for-packages` | A package fix with no changeset | `.changeset/quiet-dogs.md` with `"@app/ui": patch` in the same commit |
| `ship-no-history-rewrite` | `git push --force` to `main` | `--force-with-lease` on your own branch, `main` untouched |
| `ship-no-bypass` | `git commit --no-verify` past a failing hook | The hook's error fixed, then committed |
| `ship-merge-and-tidy` | Merged, the branch still checked out | Merged, deleted, back on `main` |
| `ship-one-pr-per-bug` | One pull request for three bugs | Three pull requests |
| `ship-describe-the-pr` | "Fix bug" | "Keep the filter on reload. It lived in state only and now lives in the URL. Checked in Library. Fixes #123" |
| `ship-screenshot-ui-prs` | A UI pull request with no image | A screenshot in the description |
| `ship-watch-checks` | "Pushed" while CI runs | "Pushed, all checks pass" |
| `ship-close-the-loop` | The fix merged, the issue open | The issue linked, closed and answered |
| `ship-confirm-live` | "Deployed" | "Live at the production URL, checked" |
| `ship-do-the-steps` | "Run `npm publish` when ready" | Published, or "needs your two-factor code" |

## Reporting

**Severity.** `HIGH` is a committed secret, a stray file committed or a release with failing checks. It is also history rewritten over someone's work, or a hook or check bypassed to pass. `MEDIUM` is a bundled commit or pull request, an open issue after the fix or steps handed back that could have run. `LOW` is a message that is not a Conventional Commit, a missing screenshot, a description with no why or a branch left after merge.

**Format.** One finding per root cause, citing the step when no file applies:

```
file:line - [rule-id] what is wrong
step 3 - [rule-id] what is wrong
```

Then a `Rule | Count | Severity` summary. `Block` when any `HIGH` remains, `Approve` otherwise. Mark every check you could not watch to the end as `Not verified`.
