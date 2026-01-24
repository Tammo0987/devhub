import simpleGit from "simple-git";
import type { GitStatus } from "./types";

export async function getGitStatus(path: string): Promise<GitStatus> {
  try {
    const git = simpleGit(path);

    const isRepo = await git.checkIsRepo();
    if (!isRepo) {
      return { isRepo: false };
    }

    const branchSummary = await git.branch();
    const branch = branchSummary.current;

    const status = await git.status();
    const dirty = !status.isClean();

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
