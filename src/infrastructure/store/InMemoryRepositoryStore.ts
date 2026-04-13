import type { IRepositoryStore } from '../../application/ports/IRepositoryStore';
import type { GitRepository } from '../../domain/entities/Repository';

export class InMemoryRepositoryStore implements IRepositoryStore {
  private current: GitRepository = {
    commits: [],
    branches: {},
    head: { branchName: 'master' },
    commitCounter: 0,
  };
  private snapshots: GitRepository[] = [];

  getState(): GitRepository {
    return this.current;
  }

  setState(repo: GitRepository): void {
    this.snapshots.push(this.deepCopy(this.current));
    this.current = this.deepCopy(repo);
  }

  undo(): boolean {
    if (this.snapshots.length === 0) return false;
    this.current = this.snapshots.pop()!;
    return true;
  }

  clearHistory(): void {
    this.snapshots = [];
  }

  private deepCopy<T>(obj: T): T {
    return JSON.parse(JSON.stringify(obj)) as T;
  }
}
