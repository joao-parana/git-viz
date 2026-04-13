import type { IRepositoryStore } from '../ports/IRepositoryStore';

export class UndoUseCase {
  constructor(private readonly store: IRepositoryStore) {}

  execute(): boolean {
    return this.store.undo();
  }
}
