import type { GitRepository } from '../../domain/entities/Repository';

export interface IRenderer {
  render(repo: GitRepository, selectedCommitId: string | null): void;
}
