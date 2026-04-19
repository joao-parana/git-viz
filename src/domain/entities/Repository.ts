import type { Commit } from "./Commit";
import type { Branch } from "./Branch";

export interface GitRepository {
  commits: Commit[];
  branches: Record<string, Branch>;
  head: { branchName: string };
  commitCounter: number;
}
