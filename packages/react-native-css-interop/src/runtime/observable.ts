export type Effect = {
  rerender: () => void;
  dependencies: Set<() => void>;
};

export type Observable<T> = {
  get(effect?: Effect): T;
  set(newValue: T, notify?: boolean): void;
};

export const observableNotifyQueue = new Set<() => void>();

export type ObservableOptions<T> = {
  fallback?: Observable<T>;
  name?: string;
};

export function observable<T>(
  value: T,
  { fallback, name }: ObservableOptions<T> = {},
): Observable<T> {
  const subscriptions = new Set<() => void>();

  return {
    get(effect) {
      if (effect) {
        subscriptions.add(effect.rerender);
        effect.dependencies.add(() => subscriptions.delete(effect.rerender));
      }
      return value ?? fallback?.get(effect)!;
    },

    set(newValue, notify = true) {
      if (Object.is(newValue, value)) return;
      value = newValue;
      if (notify) {
        // We need to copy the subscriptions as new ones may be added during the render, causing an infinite growing subscriptions set
        for (const sub of [...subscriptions]) {
          sub();
        }
      } else {
        for (const sub of subscriptions) {
          observableNotifyQueue.add(sub);
        }
      }
    },
  };
}

export function cleanupEffect(effect: Effect) {
  for (const dep of effect.dependencies) {
    dep();
  }
  effect.dependencies.clear();
}
