export class EmptyCommitMessageError extends Error {
  constructor() {
    super('Commit message cannot be empty');
    this.name = 'EmptyCommitMessageError';
  }
}

export class DuplicateBranchError extends Error {
  constructor(name: string) {
    super(`Branch '${name}' already exists`);
    this.name = 'DuplicateBranchError';
  }
}

export class SelfMergeError extends Error {
  constructor() {
    super('Cannot merge a branch into itself');
    this.name = 'SelfMergeError';
  }
}

export class BranchNotFoundError extends Error {
  constructor(name: string) {
    super(`Branch '${name}' not found`);
    this.name = 'BranchNotFoundError';
  }
}
