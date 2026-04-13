import type { IRepositoryStore } from '../ports/IRepositoryStore';
import { EmptyCommitMessageError } from '../../domain/errors/DomainErrors';
import type { Commit } from '../../domain/entities/Commit';

export interface AddCommitInput {
  message: string;
  author?: string;
}

export class AddCommitUseCase {
  constructor(private readonly store: IRepositoryStore) {}

  execute(input: AddCommitInput): void {
    const { message, author = 'Você' } = input;
    if (!message.trim()) throw new EmptyCommitMessageError();

    const repo = this.store.getState();
    const branchName = repo.head.branchName;
    const parentId = repo.branches[branchName]?.tipCommitId ?? null;
    const id = `c${repo.commitCounter + 1}`;

    const commit: Commit = {
      id,
      message,
      branchName,
      parentIds: parentId ? [parentId] : [],
      timeIndex: repo.commits.length,
      author,
      timestamp: Date.now(),
    };

    this.store.setState({
      ...repo,
      commitCounter: repo.commitCounter + 1,
      commits: [...repo.commits, commit],
      branches: {
        ...repo.branches,
        [branchName]: { ...repo.branches[branchName], tipCommitId: id },
      },
    });
  }
}
