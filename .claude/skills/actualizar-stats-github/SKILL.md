---
name: actualizar-stats-github
description: Refresh the website repo's GitHub numbers shown across the site (/desarrollo collaboration stats, the contributions on each profile, /vinculos) by regenerating the committed snapshot src/data/github-stats.json, sanity-checking the diff and committing it. Use when the user asks to update, refresh or sync the GitHub stats, contributors, commits, PRs, lines of code or languages shown on the website.
---

# Actualizar las stats de GitHub del website

The site never calls the GitHub API while rendering. Every GitHub number on the website comes
from one committed snapshot, `src/data/github-stats.json`, read through
`getCollaborationStats()` in `src/lib/github-stats.ts`. It feeds:

- `/desarrollo` → "Estadísticas de colaboración" (`src/components/desarrollo/collaboration-stats.tsx`):
  commits, PRs, contributors, median time to merge, stars, forks, weekly activity, languages,
  lines of code, and every contributor with lines added/deleted and first contribution.
- `/perfil/[id]` → the contributions of users linked to a GitHub login
  (`src/app/(platform)/perfil/[id]/profile-data.ts`).
- `/vinculos` → the GitHub logins an admin can link to users.
- `/desarrollo` → "Team de desarrollo" (`src/components/landing/team.tsx`): the people listed by
  hand there (with their name and role) plus every other contributor in the snapshot, who shows
  up automatically as "Contributor" with their GitHub avatar.

Updating the stats means regenerating that file. Don't ask questions the steps answer.

## Steps

1. **Run the script** from the repo root:

   ```bash
   pnpm github:stats
   ```

   It uses `GITHUB_TOKEN` or, if that isn't set, the `gh` CLI's token (`gh auth token`). Without
   either it still works unauthenticated (60 requests/hour), which is enough for one run.
   GitHub computes the `/stats/*` endpoints in the background and answers `202` until they are
   ready; the script retries for ~30 s and, if one still isn't ready, keeps that part's previous
   value and prints a `!` warning. If you see a warning, wait a minute and run it again so the
   snapshot is complete.

2. **Sanity-check the diff** with `git diff --stat src/data/github-stats.json` and a quick read
   of the changed top-level numbers. Commits, merged PRs and contributors should only grow;
   `updatedAt` must be now. A number that shrank a lot or a contributor that vanished means a
   partial response — rerun instead of committing it. Report the before → after of commits,
   merged PRs, contributors and lines of code to the user.

3. **Check new contributors.** If a login appears that wasn't in the previous snapshot, tell the
   user: it already shows in the team on `/desarrollo` as "Contributor"; an admin can link it to
   a user at `/vinculos` so it shows on their profile (and the team links to it), and adding it
   to `knownPeople` in `src/components/landing/team.tsx` gives it a name and a role. Don't link
   it yourself.

4. **Commit only the snapshot**:

   ```bash
   git add src/data/github-stats.json
   git commit -m "chore(desarrollo): update GitHub stats"
   ```

   (Ending with the session attribution line, as for every commit.)

## Changing what is collected

If the user wants a new GitHub number on the site, add it in three places together:
`scripts/update-github-stats.mjs` (fetch it and put it in the snapshot), the
`CollaborationStats` type in `src/lib/github-stats.ts`, and the component that shows it. Then
run the script so the committed JSON has the new field before committing the code.
