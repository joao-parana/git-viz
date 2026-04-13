import type { IRepositoryStore } from '../ports/IRepositoryStore';
import { BranchNotFoundError } from '../../domain/errors/DomainErrors';

export class CheckoutBranchUseCase {
  constructor(private readonly store: IRepositoryStore) {}

  execute(input: { branchName: string }): void {
    const { branchName } = input;
    const repo = this.store.getState();

    if (!repo.branches[branchName]) throw new BranchNotFoundError(branchName);

    this.store.setState({
      ...repo,
      head: { branchName },
    });
  }
}
