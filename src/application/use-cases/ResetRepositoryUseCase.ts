import type { IRepositoryStore } from '../ports/IRepositoryStore';
import type { GitRepository } from '../../domain/entities/Repository';
import type { Commit } from '../../domain/entities/Commit';
import type { Branch } from '../../domain/entities/Branch';

export class ResetRepositoryUseCase {
  constructor(private readonly store: IRepositoryStore) {}

  execute(): void {
    const initialCommit: Commit = {
      id: 'c1',
      message: 'initial commit',
      branchName: 'master',
      parentIds: [],
      timeIndex: 0,
      author: 'Você',
      timestamp: Date.now(),
    };

    const masterBranch: Branch = {
      name: 'master',
      color: '#7dd3fc',
      tipCommitId: 'c1',
      lane: 0,
    };

    const repo: GitRepository = {
      commits: [initialCommit],
      branches: { master: masterBranch },
      head: { branchName: 'master' },
      commitCounter: 1,
    };

    this.store.setState(repo);
    this.store.clearHistory();
  }
}
