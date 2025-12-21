import { ZodType, z } from 'zod';
import eventBus from './eventBus';

export const EventName = 'custom-event-chat-11.18';
export const createEvent = <Detail, Name extends string = string>(
  detail: EventDetailType<Detail, Name>
) =>
  new CustomEvent(EventName, {
    bubbles: true,
    cancelable: true,
    detail,
  });

export const createToken = (key: string): string =>
  window.btoa(`${key}:${Math.random()}:${Date.now()}`);

export const getConditionKey = (name: string, id: string, type?: string) =>
  [name, id, type].filter(Boolean).join('-');

// 考虑空字符的情况
export const getEventName = <T extends string>(name: T) =>
  name ? `event-chart-${name}` : undefined;

export function hasSchema<Schema extends ZodType, Name extends string>(
  ops: EventChatOptions<Schema, Name> | undefined
): ops is EventChatOptionsWithSchema<Schema, Name> {
  return !!ops && 'schema' in ops && ops.schema !== undefined;
}

export const isResultType = (data: unknown): data is ResultType =>
  typeof data === 'object' && data !== null && 'success' in data && !data.success;

export const isSafetyType = <T>(target: unknown, origin: T): target is T => target === origin;

export function mountEvent(event: CustomDetailEvent) {
  const { name: detailName } = event.detail ?? {};
  const currentName = detailName ? getEventName(detailName) : undefined;
  if (currentName && event.detail) {
    eventBus.emit(currentName, event.detail);
  }
}

export type EventChatOptions<Schema extends ZodType, Name extends string = string> =
  | EventChatOptionsWithoutSchema<Name>
  | EventChatOptionsWithSchema<Schema, Name>;

export type EventChatOptionsWithSchema<
  Schema extends ZodType,
  Name extends string = string,
> = EventChatOptionsBase<DetailTypeWithSchema<Name, Schema>> & {
  schema: Schema;
};

export type EventChatOptionsWithoutSchema<Name extends string = string> = EventChatOptionsBase<
  DetailTypeWithoutSchema<Name>
> & {
  schema?: never;
};

export type EventDetailType<Detail = unknown, Name extends string = string> = Pick<
  DetailBaseType<Name>,
  '__origin' | 'name'
> &
  Pick<EventChatOptionsWithoutSchema, 'group' | 'type'> & {
    id: string;
    detail?: Detail;
    global?: boolean;
    token?: string;
  };

export type MountOpsType<Name extends string = string, Schema extends ZodType = ZodType> = Omit<
  EventChatOptionsWithSchema<Schema, Name>,
  'callback' | 'token'
> &
  Pick<EventDetailType, 'token'>;

export type ResultType<Schema = unknown> = z.ZodSafeParseError<Schema>;

interface CustomDetailEvent extends Event {
  detail?: EventDetailType;
}

type DetailBaseType<Name extends string = string> = {
  __origin: string;
  name: Name;
};

type DetailTypeWithSchema<
  Name extends string = string,
  Schema extends ZodType = ZodType,
> = DetailBaseType<Name> & {
  detail: z.output<Schema>;
};

type DetailTypeWithoutSchema<Name extends string = string> = DetailBaseType<Name> & {
  detail?: unknown;
};

type EventChatOptionsBase<DetailType> = {
  async?: boolean;
  group?: string;
  token?: boolean;
  type?: string;
  callback?: (target: DetailType) => void;
  debug?: (result?: ResultType) => void;
};
