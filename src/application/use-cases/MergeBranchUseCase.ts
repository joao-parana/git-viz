import type { IRepositoryStore } from '../ports/IRepositoryStore';
import { SelfMergeError, BranchNotFoundError } from '../../domain/errors/DomainErrors';
import type { Commit } from '../../domain/entities/Commit';

export class MergeBranchUseCase {
  constructor(private readonly store: IRepositoryStore) {}

  execute(input: { sourceBranchName: string }): void {
    const { sourceBranchName } = input;
    const repo = this.store.getState();
    const targetBranchName = repo.head.branchName;

    if (sourceBranchName === targetBranchName) throw new SelfMergeError();
    if (!repo.branches[sourceBranchName]) throw new BranchNotFoundError(sourceBranchName);

    const tipTarget = repo.branches[targetBranchName].tipCommitId;
    const tipSource = repo.branches[sourceBranchName].tipCommitId;
    const id = `c${repo.commitCounter + 1}`;

    const commit: Commit = {
      id,
      message: `merge ${sourceBranchName} -> ${targetBranchName}`,
      branchName: targetBranchName,
      parentIds: [tipTarget, tipSource].filter((p): p is string => p !== null),
      timeIndex: repo.commits.length,
      author: 'Você',
      timestamp: Date.now(),
    };

    this.store.setState({
      ...repo,
      commitCounter: repo.commitCounter + 1,
      commits: [...repo.commits, commit],
      branches: {
        ...repo.branches,
        [targetBranchName]: { ...repo.branches[targetBranchName], tipCommitId: id },
      },
    });
  }
}
