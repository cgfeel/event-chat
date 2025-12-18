import { DetailType, EventDetailType, isResultType, MountOpsType } from './utils';
import { validate } from './validate';

class EventBus {
  // event 可以挂载同名事件，而 condition 根据回调函数记录
  private condition = new WeakMap<(args: DetailType) => void, MountOpsType>();
  private events: Record<string, Array<(args: DetailType) => void>>;

  constructor() {
    this.events = {};
  }

  emit(eventName: string, args: EventDetailType): void {
    if (!this.events[eventName]) return;
    [...this.events[eventName]].forEach((callback) => {
      const record = this.condition.get(callback);
      if (record) {
        const { debug } = record;
        validate(args, record)
          .then(() => callback(args))
          .catch((error) => {
            const { cause } = error instanceof Error ? error : {};
            if (error instanceof Error && debug)
              debug(args, isResultType(cause) ? cause : undefined);
          });
      } else {
        callback(args);
      }
    });
  }

  off(eventName: string, callback?: (args: DetailType) => void): void {
    if (!this.events[eventName]) return;
    if (callback) {
      this.events[eventName] = this.events[eventName].filter((cb) => cb !== callback);
    } else {
      this.events[eventName] = [];
    }
  }

  on(eventName: string, callback: (args: DetailType) => void): void {
    if (!this.events[eventName]) {
      this.events[eventName] = [];
    }
    if (!this.events[eventName].includes(callback)) {
      this.events[eventName].push(callback);
    }
  }

  mount(callback: (args: DetailType) => void, item: MountOpsType) {
    this.condition.set(callback, item);
  }

  once(eventName: string, callback: (args: DetailType) => void): void {
    const wrapper = (args: DetailType) => {
      callback(args);
      this.off(eventName, wrapper);
    };
    this.on(eventName, wrapper);
  }

  unmount(callback: (args: DetailType) => void) {
    this.condition.delete(callback);
  }
}

export default new EventBus();
