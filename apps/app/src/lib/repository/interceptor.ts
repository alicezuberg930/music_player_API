export type InterceptorAction<T> = {
  onFulfilled?: (value: T) => Promise<T> | T;
  onRejected?: (error: unknown) => Promise<void> | void;
};

export class InterceptorManager<T> {
  private readonly handlers = new Map<number, InterceptorAction<T>>();
  private nextId = 0;

  use(
    onFulfilled?: InterceptorAction<T>['onFulfilled'],
    onRejected?: InterceptorAction<T>['onRejected'],
  ) {
    const id = this.nextId;
    this.nextId += 1;
    this.handlers.set(id, { onFulfilled, onRejected });
    return id;
  }

  eject(id: number) {
    this.handlers.delete(id);
  }

  clear() {
    this.handlers.clear();
  }

  getHandlers() {
    return Array.from(this.handlers.values());
  }

  async runFulfilled(initialValue: T) {
    let value = initialValue;
    for (const { onFulfilled } of this.handlers.values()) {
      if (onFulfilled) {
        value = await onFulfilled(value);
      }
    }
    return value;
  }

  async runRejected(error: unknown) {
    for (const { onRejected } of this.handlers.values()) {
      if (onRejected) {
        await onRejected(error);
      }
    }
  }
}
