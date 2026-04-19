import type { GitRepository } from "../../domain/entities/Repository";

export interface IRepositoryStore {
  getState(): GitRepository;
  setState(repo: GitRepository): void;
  undo(): boolean;
  clearHistory(): void;
}
