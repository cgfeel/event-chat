import { ZodType, z } from 'zod';
import eventBus from './eventBus';

export const EventName = 'custom-event-chat-11.18';
export const createEvent = <Detail, Name extends NamepathType = string>(
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
export const getEventName = (name: NamepathType) => {
  const path = Array.isArray(name) ? name : [name];
  try {
    // 如果传入空字符会得到 event-chart_[""]
    return `event-chart_${JSON.stringify(path)}`;
  } catch {
    return `event-chart_[]`;
  }
};

export const isResultType = (data: unknown): data is ResultType =>
  typeof data === 'object' && data !== null && 'success' in data && !data.success;

export const isSafetyType = <T>(target: unknown, origin: T): target is T => {
  if (target && origin && typeof origin === 'object') {
    try {
      return JSON.stringify(target) === JSON.stringify(origin);
    } catch {
      return false;
    }
  }
  return target === origin;
};

export function mountEvent(event: CustomDetailEvent) {
  const { name: detailName } = event.detail ?? {};
  const currentName = detailName ? getEventName(detailName) : undefined;
  if (currentName && event.detail) {
    eventBus.emit(currentName, event.detail);
  }
}

export interface EventChatOptions<
  Name extends NamepathType,
  Schema extends ZodType | undefined = undefined,
  Group extends string | undefined = undefined,
  Type extends string | undefined = undefined,
  Token extends boolean | undefined = undefined,
> {
  async?: boolean;
  group?: Group;
  schema?: Schema;
  token?: Token;
  type?: Type;
  callback?: (target: DetailType<Name, Schema, Group, Type, Token>) => void;
  debug?: (result?: ResultType) => void;
}

export type DetailType<
  Name extends NamepathType,
  Schema extends ZodType | undefined = undefined,
  Group extends string | undefined = undefined,
  Type extends string | undefined = undefined,
  Token extends boolean | undefined = undefined,
> = Pick<EventDetailType<unknown, Name>, 'global' | 'id' | 'name' | 'time'> & {
  detail: WasProvided<Schema> extends true ? z.output<Exclude<Schema, undefined>> : unknown;
  group: WasProvided<Group> extends true ? Exclude<Group, undefined> : undefined;
  origin: string;
  type: WasProvided<Type> extends true ? Exclude<Type, undefined> : undefined;
  token: Token extends true ? string : undefined;
};

export type EventDetailType<Detail = unknown, Name extends NamepathType = NamepathType> = {
  id: string;
  name: Name;
  origin: NamepathType;
  time: Date;
  detail?: Detail;
  global?: boolean;
  group?: string;
  type?: string;
  token?: string;
};

export type NamepathType =
  | number
  | string
  | Array<string | number>
  | Readonly<Array<string | number>>;

export type ResultType<Schema = unknown> = Omit<z.ZodSafeParseError<Schema>, 'data'> & {
  data: unknown;
  time: Date;
};

// 工具类型：判断在调用中，泛型 T 是否“实际上被提供了参数”
// 如果被提供了（无论具体值还是undefined），T会被实例化为具体的类型（如 string, number, undefined）
// 如果没被提供，T会保持其默认值或整个约束类型
export type WasProvided<T, Default = undefined> =
  // 关键判断：如果 T 不等于 Default，且不等于约束的“或undefined”部分，则认为它被提供了
  [T] extends [Default]
    ? false
    : [T] extends [undefined]
      ? false // 单独处理只传了 undefined 的情况，如果将其视为“已提供但值为空”
      : true;

interface CustomDetailEvent extends Event {
  detail?: EventDetailType;
}
