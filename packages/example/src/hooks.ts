import { useCallback, useEffect, useMemo } from 'react';
import eventBus from './eventBus';

const EventName = 'custom-event-chat-11.18';
function mountEvent(event: CustomDetailEvent) {
  const { name: detailName } = event.detail ?? {};
  const currentName = detailName ? getEventName(detailName) : undefined;
  if (currentName) {
    eventBus.emit(currentName, event.detail);
  }
}

const getEventName = (name: string) => (name ? `event-chart-${name}` : undefined);
const createEvent = (detail?: CustomDetailEvent['detail']) =>
  new CustomEvent(EventName, {
    bubbles: true,
    cancelable: true,
    detail,
  });

export const useEventChat = (name: string, ops: EventChatOptions) => {
  const eventName = useMemo(() => getEventName(name), [name]);
  const { callback } = ops;
  const emit = useCallback(
    (detail?: CustomDetailEvent['detail']) => {
      if (name && detail) {
        const event = createEvent({ ...detail, __origin: name });
        document.body.dispatchEvent(event);
      }
    },
    [name]
  );

  useEffect(() => {
    if (eventName) eventBus.on(eventName, callback);
    return () => {
      if (eventName) eventBus.off(eventName, callback);
    };
  }, [eventName, callback]);

  useEffect(() => {
    if (!document.body.dataset.globalIsListened) {
      document.body.addEventListener(EventName, mountEvent);
      document.body.dataset.globalIsListened = '1';
    }
  }, []);

  return [emit] as const;
};

interface CustomDetailEvent extends Event {
  detail?: {
    name: string;
    [key: string]: unknown;
  };
}

interface EventChatOptions {
  callback: (detail: unknown) => void;
}
