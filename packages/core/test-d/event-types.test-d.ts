import { expectAssignable, expectType } from 'tsd';
import { z } from 'zod';
import type { EventChatOptions, EventChatOptionsWithSchema, ResultType } from '../dist/utils';

// 1. 测试带 Schema 的 EventChatOptions 合规性
const userSchema = z.object({
  id: z.string(),
  name: z.string(),
});

type UserSchema = typeof userSchema;

const withSchemaOptions: EventChatOptionsWithSchema<UserSchema, 'user.created'> = {
  group: 'user-items',
  schema: userSchema,
  type: 'created',
  callback: (record) => {
    expectType<string>(record.__origin);
    expectType<'user.created'>(record.name);
    expectType<{ id: string; name: string }>(record.detail);
  },
  debug: (result) => {
    expectType<ResultType | undefined>(result);
  },
};

// 验证类型可赋值
expectAssignable<EventChatOptions<UserSchema, 'user.created'>>(withSchemaOptions);
