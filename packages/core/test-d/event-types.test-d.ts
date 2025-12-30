import { expectAssignable, expectType } from 'tsd';
import { z } from 'zod';
import type { EventChatOptions, EventDetailType, ResultType } from '../dist/utils';

// -------------------------- EventChatOptions 测试用例 --------------------------
// 1. 测试带 Schema 的 EventChatOptions 合规性
const userSchema = z.object({
  id: z.string(),
  name: z.string(),
});

type UserSchema = typeof userSchema;

const withSchemaOptions: EventChatOptions<'user.created', UserSchema, 'user-items', 'created'> = {
  group: 'user-items',
  schema: userSchema,
  type: 'created',
  callback: (record) => {
    // 验证 detail 类型是否符合 DetailTypeWithSchema
    expectType<string>(record.__origin);
    expectType<'user.created'>(record.name);
    expectType<{ id: string; name: string }>(record.detail);
  },
  debug: (result) => {
    expectType<ResultType | undefined>(result);
  },
};

// 验证类型可赋值
expectAssignable<EventChatOptions<'user.created', UserSchema, 'user-items', 'created'>>(
  withSchemaOptions
);

// 2. 测试不带 Schema 的 EventChatOptions 合规性
const withoutSchemaOptions: EventChatOptions<'message.sent', undefined, 'message', 'sent'> = {
  group: 'message',
  type: 'sent',
  callback: (record) => {
    // 验证 detail 类型是否符合 DetailTypeWithoutSchema
    expectType<string>(record.__origin);
    expectType<'message.sent'>(record.name);
    expectType<unknown | undefined>(record.detail);
  },
};

expectAssignable<EventChatOptions<'message.sent', undefined, 'message', 'sent'>>(
  withoutSchemaOptions
);

// -------------------------- EventDetailType 测试用例 --------------------------
// 1. 测试带自定义 Detail 的 EventDetailType
type CustomDetail = {
  content: string;
  timestamp: number;
};

const eventDetail: EventDetailType<CustomDetail, 'chat.message'> = {
  __origin: 'web-client',
  name: 'chat.message',
  id: '123456',
  detail: {
    content: 'Hello World',
    timestamp: 1719283645000,
  },
  group: 'chat',
  type: 'message',
  global: true,
  token: 'abc-123',
};

// 验证各个字段类型
expectType<string>(eventDetail.__origin);
expectType<'chat.message'>(eventDetail.name);
expectType<string>(eventDetail.id);
expectType<CustomDetail | undefined>(eventDetail.detail);
expectType<boolean | undefined>(eventDetail.global);
expectType<string | undefined>(eventDetail.token);
expectType<string | undefined>(eventDetail.group);
expectType<string | undefined>(eventDetail.type);

// 2. 测试默认 Detail（unknown）的 EventDetailType
const defaultDetail: EventDetailType<unknown, 'system.notice'> = {
  __origin: 'mobile-client',
  name: 'system.notice',
  id: '654321',
  detail: { anyKey: 'anyValue' },
  token: undefined,
};

// 验证各个字段类型
expectType<string>(defaultDetail.__origin);
expectType<'system.notice'>(defaultDetail.name);
expectType<string>(defaultDetail.id);
expectType<unknown | undefined>(defaultDetail.detail);
expectType<boolean | undefined>(defaultDetail.global);
expectType<string | undefined>(defaultDetail.token);
expectType<string | undefined>(defaultDetail.group);
expectType<string | undefined>(defaultDetail.type);
