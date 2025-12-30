import type z from 'zod';
import type { ZodType } from 'zod';
import BasicPrint from './BasicPrint';

const EventChatOptions = <
  Name extends string,
  Schema extends ZodType | undefined = undefined,
  Group extends string | undefined = undefined,
  Type extends string | undefined = undefined,
  Token extends boolean | undefined = undefined,
>(
  props: EventChatOptionsProps<Name, Schema, Group, Type, Token>
) => <BasicPrint {...props} />;

export default EventChatOptions;

export interface EventChatOptionsProps<
  Name extends string,
  Schema extends ZodType | undefined = undefined,
  Group extends string | undefined = undefined,
  Type extends string | undefined = undefined,
  Token extends boolean | undefined = undefined,
> {
  /**
   * `schema` 包含异步规则需设置为 `true`，未提供 `Schema` 时无需提供
   */
  async?: boolean;
  /**
   * 指定群组名，用于接收群组内部消息
   */
  group?: Group;
  /**
   * 数据模型
   */
  schema?: Schema;
  /**
   * 接受的信息，需要带上当前消息的密钥
   */
  token?: Token;
  /**
   * 用于同组件且同事件名，获取不同的 token
   */
  type?: Type;
  /**
   * 消息回调函数，接受的参数类型将包含和指定的 `schema` 类型一致的 `detail`，详细见下方说明
   */
  callback?: (target: DetailType<Name, Schema, Group, Type, Token>) => void;
  /**
   * 调试函数，收集不满足条件收信要求的消息
   */
  debug?: (result?: ResultType) => void;
}

type DetailType<
  Name extends string,
  Schema extends ZodType | undefined = undefined,
  Group extends string | undefined = undefined,
  Type extends string | undefined = undefined,
  Token extends boolean | undefined = undefined,
> = {
  __origin: string;
  id: string;
  name: Name;
  detail: WasProvided<Schema> extends true ? z.output<Exclude<Schema, undefined>> : unknown;
  group: WasProvided<Group> extends true ? Exclude<Group, undefined> : undefined;
  type: WasProvided<Type> extends true ? Exclude<Type, undefined> : undefined;
  token: Token extends true ? string : undefined;
  global?: boolean;
};

type ResultType<Schema = unknown> = Omit<z.ZodSafeParseError<Schema>, 'data'> & {
  data: unknown;
};

type WasProvided<T, Default = undefined> =
  // 关键判断：如果 T 不等于 Default，且不等于约束的“或undefined”部分，则认为它被提供了
  [T] extends [Default]
    ? false
    : [T] extends [undefined]
      ? false // 单独处理只传了 undefined 的情况，如果将其视为“已提供但值为空”
      : true;
