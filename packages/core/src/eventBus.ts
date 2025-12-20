import { EventDetailType } from './utils';

class EventBus {
  private events: Record<string, Array<(data: EventDetailType) => void>>;
  constructor() {
    this.events = {};
  }

  emit(eventName: string, args: EventDetailType): void {
    if (!this.events[eventName]) return;
    [...this.events[eventName]].forEach((callback) => {
      callback(args);
    });
  }

  off(eventName: string, callback?: (args: EventDetailType) => void): void {
    if (!this.events[eventName]) return;
    if (callback) {
      this.events[eventName] = this.events[eventName].filter((cb) => cb !== callback);
    } else {
      this.events[eventName] = [];
    }
  }

  on(eventName: string, callback: (data: EventDetailType) => void): void {
    if (!this.events[eventName]) {
      this.events[eventName] = [];
    }
    if (!this.events[eventName].includes(callback)) {
      this.events[eventName].push(callback);
    }
  }

  once(eventName: string, callback: (data: EventDetailType) => void): void {
    const wrapper = (args: EventDetailType) => {
      callback(args);
      this.off(eventName, wrapper);
    };
    this.on(eventName, wrapper);
  }
}

export default new EventBus();
