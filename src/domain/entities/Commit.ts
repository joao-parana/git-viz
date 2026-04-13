export interface Commit {
  readonly id: string;         // ex: "c1", "c2"
  readonly message: string;
  readonly branchName: string;
  readonly parentIds: string[]; // 0 = inicial, 1 = normal, 2 = merge
  readonly timeIndex: number;
  readonly author: string;
  readonly timestamp: number;   // Unix ms (Date.now())
}
