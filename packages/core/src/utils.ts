import { z, ZodType } from 'zod';
import eventBus from './eventBus';

export const EventName = 'custom-event-chat-11.18';
export const createEvent = <Detail>(detail: EventDetailType<Detail>) =>
  new CustomEvent(EventName, {
    bubbles: true,
    cancelable: true,
    detail,
  });

export const createToken = (key: string) => window.btoa(`${key}:${Math.random()}:${Date.now()}`);

export const getConditionKey = (name: string, id: string, type?: string) =>
  [name, id, type].filter(Boolean).join('-');

// 考虑空字符的情况
export const getEventName = <T extends string>(name: T) =>
  name ? `event-chart-${name}` : undefined;

export function mountEvent(event: CustomDetailEvent) {
  const { name: detailName } = event.detail ?? {};
  const currentName = detailName ? getEventName(detailName) : undefined;
  if (currentName && event.detail) {
    eventBus.emit(currentName, event.detail);
  }
}

export const isResultType = (data: unknown): data is ResultType =>
  typeof data === 'object' && data !== null && 'success' in data && Boolean(data.success);

export const isSafetyType = <T>(target: unknown, origin: T): target is T => target === origin;

export interface EventChatOptions<Name extends string = string, Schema extends ZodType = ZodType> {
  async?: boolean;
  group?: string;
  schema?: Schema;
  type?: string;
  callback?: (target: DetailType<Name, Schema>) => void;
  debug?: (data: unknown, result?: ResultType) => void;
}

export type DetailType<Name extends string = string, Schema extends ZodType = ZodType> = {
  __origin: string;
  name: Name;
  detail?: z.infer<Schema>;
};

export type EventDetailType<Detail = unknown> = Pick<DetailType, '__origin' | 'name'> &
  Pick<EventChatOptions, 'group' | 'type'> & {
    id: string;
    detail?: Detail;
    global?: boolean;
    token?: string;
  };

export type MountOpsType = Omit<EventChatOptions, 'callback'> & Pick<EventDetailType, 'token'>;

export type ResultType = z.ZodSafeParseResult<unknown>;

interface CustomDetailEvent extends Event {
  detail?: EventDetailType;
}
