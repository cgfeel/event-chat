import { beforeEach, describe, expect, rstest, test } from '@rstest/core';
import z from 'zod';
import eventBus from '../src/eventBus';
import {
  EventDetailType,
  EventName,
  createEvent,
  createToken,
  getConditionKey,
  getEventName,
  isResultType,
  isSafetyType,
  mountEvent,
} from '../src/utils';

const message = 'hello validation';
const name = 'test-event' as const;
const config = {
  group: 'test-group',
  token: 'test-token-456',
};

const baseTestData: EventDetailType<{ message: string }> = {
  ...config,
  detail: { message },
  id: 'test-id-123',
  origin: 'test-origin',
  type: 'test-type',
  name,
};

const testSchema = z.object({ message: z.string() });

beforeEach(() => {
  rstest.clearAllMocks();
});

describe('工具函数单元测试', () => {
  test('EventName: 应该等于预设的自定义事件名称', () => {
    expect(typeof EventName).toBe('string');
    expect(EventName).not.toBe('');
  });

  test('createEvent: 正确配置的CustomEvent实例', () => {
    const event = createEvent(baseTestData);
    expect(event).toBeInstanceOf(CustomEvent);
    expect(event.type).toBe(EventName);
    expect(event.bubbles).toBeTruthy();
    expect(event.cancelable).toBeTruthy();
    expect(event.detail).toEqual(baseTestData);
  });

  test('createToken: 生成一个基于btoa编码的token字符串', () => {
    const testKey = 'test-key';
    const token = createToken(testKey);
    const decodedToken = window.atob(token);
    const [key, random, timestamp] = decodedToken.split(':');

    expect(key).toBe(testKey);
    expect(Number(random)).toBeGreaterThan(0);
    expect(Number(timestamp)).toBeLessThanOrEqual(Date.now());
    expect(typeof token).toBe('string');
  });

  test('getConditionKey: 过滤空值并以连字符拼接参数', () => {
    expect(getConditionKey('name', '123', 'type')).toBe('name-123-type');
    expect(getConditionKey('name', '123', '')).toBe('name-123');
    expect(getConditionKey('name', '123')).toBe('name-123');
    expect(getConditionKey('name', '', 'type')).toBe('name-type');
  });

  test('getEventName: 获取事件名', () => {
    expect(getEventName('test')).toBe(`event-chart_${JSON.stringify(['test'])}`);
    expect(getEventName('')).toBe(`event-chart_${JSON.stringify([''])}`);
  });

  test('isResultType: 获取校验失败的对象', () => {
    const options = { group: 'test', schema: testSchema };
    const validResult = {
      success: false,
      error: { issues: [], name: 'ZodError' },
      data: null,
    };
    expect(isResultType(validResult)).toBeTruthy();
    expect(isResultType(options)).toBeFalsy();
    expect(isResultType({})).toBeFalsy();
    expect(isResultType({ success: true, data: 'test' })).toBeFalsy();
    expect(isResultType('string')).toBeFalsy();
    expect(isResultType(null)).toBeFalsy();
  });

  test('isSafetyType: 将一个未知类型判定为特定类型', () => {
    const testObj = { a: 1 };
    expect(isSafetyType(testObj, testObj)).toBeTruthy();
    expect(isSafetyType(123, 123)).toBeTruthy();
    expect(isSafetyType('test', 'test')).toBeTruthy();
    expect(isSafetyType({ a: 1 }, { a: 1 })).toBeTruthy();

    expect(isSafetyType(123, 456)).toBeFalsy();
    expect(isSafetyType('test', 'test2')).toBeFalsy();
  });

  test('mountEvent: 通过 eventBus 发送事件', () => {
    const mockCallback = rstest.fn();
    const spyOn = rstest.spyOn(eventBus, 'emit').mockImplementation(mockCallback);

    const event = createEvent(baseTestData);
    const eventName = getEventName(baseTestData.name) ?? '';

    mountEvent(event);
    expect(mockCallback).toHaveBeenCalledTimes(1);
    expect(mockCallback).toHaveBeenCalledWith(eventName, baseTestData);

    spyOn.mockRestore();
  });

  test('mountEvent: 当 name 为空时不会发送事件', () => {
    const mockCallback = rstest.fn();
    const spyOn = rstest.spyOn(eventBus, 'emit').mockImplementation(mockCallback);
    const event = createEvent({ ...baseTestData, name: '' });

    mountEvent(event);
    expect(mockCallback).toHaveBeenCalledTimes(0);

    spyOn.mockRestore();
  });
});
