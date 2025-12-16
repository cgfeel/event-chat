class EventBus<T = unknown> {
  private events: Record<PropertyKey, ListType<(...args: T[]) => void>>;
  constructor() {
    this.events = {};
  }

  on(eventName: string, callback: (...args: T[]) => void): void {
    if (!this.events[eventName]) {
      this.events[eventName] = [];
    }
    if (!this.events[eventName].includes(callback)) {
      this.events[eventName].push(callback);
    }
  }

  off(eventName: string, callback?: (...args: T[]) => void): void {
    if (!this.events[eventName]) return;
    if (callback) {
      this.events[eventName] = this.events[eventName].filter((cb) => cb !== callback);
    } else {
      this.events[eventName] = [];
    }
  }

  emit(eventName: string, ...args: T[]): void {
    if (!this.events[eventName]) return;
    [...this.events[eventName]].forEach((callback) => {
      callback(...args);
    });
  }

  once(eventName: string, callback: (...args: T[]) => void): void {
    const wrapper = (...args: T[]) => {
      callback(...args);
      this.off(eventName, wrapper);
    };
    this.on(eventName, wrapper);
  }
}

export default new EventBus();

type ListType<T> = T[];
