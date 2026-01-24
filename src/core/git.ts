import simpleGit from "simple-git";
import type { GitStatus } from "./types";

export async function getGitStatus(path: string): Promise<GitStatus> {
  try {
    const git = simpleGit(path);

    // Check if it's a git repo
    const isRepo = await git.checkIsRepo();
    if (!isRepo) {
      return { isRepo: false };
    }

    // Get current branch
    const branchSummary = await git.branch();
    const branch = branchSummary.current;

    // Get status
    const status = await git.status();
    const dirty = !status.isClean();

    // Get ahead/behind
    const ahead = status.ahead;
    const behind = status.behind;

    return {
      isRepo: true,
      branch,
      dirty,
      ahead,
      behind,
    };
  } catch {
    return { isRepo: false };
  }
}
