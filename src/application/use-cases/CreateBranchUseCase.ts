import type { IRepositoryStore } from '../ports/IRepositoryStore';
import { DuplicateBranchError } from '../../domain/errors/DomainErrors';
import type { Branch } from '../../domain/entities/Branch';

const BRANCH_COLORS = [
  '#7dd3fc', // sky
  '#fca5a5', // red
  '#fcd34d', // amber
  '#a7f3d0', // green
  '#c4b5fd', // violet
  '#f9a8d4', // pink
  '#93c5fd', // blue
  '#fdba74', // orange
];

export class CreateBranchUseCase {
  constructor(private readonly store: IRepositoryStore) {}

  execute(input: { name: string }): void {
    const { name } = input;
    const repo = this.store.getState();

    if (repo.branches[name]) throw new DuplicateBranchError(name);

    const lane = Object.keys(repo.branches).length;
    const color = BRANCH_COLORS[lane % BRANCH_COLORS.length];
    const currentTip = repo.branches[repo.head.branchName]?.tipCommitId ?? null;

    const branch: Branch = { name, color, tipCommitId: currentTip, lane };

    this.store.setState({
      ...repo,
      branches: { ...repo.branches, [name]: branch },
    });
  }
}
