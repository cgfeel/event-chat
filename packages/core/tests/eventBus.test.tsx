import { beforeEach, describe, expect, rstest, test } from '@rstest/core';
import { EventDetailType } from '../src';
import eventBus from '../src/eventBus';

// 定义测试用的 EventDetailType 数据
const eventName = 'test-on-emit';
const message = 'hello event bus';
const testEventData: EventDetailType = {
  detail: { message },
  global: true,
  group: 'test-group',
  id: 'test-id-123',
  name: 'test-evet',
  origin: 'test-origin',
  time: new Date(),
  token: 'test-token-456',
  type: 'test-type',
};

beforeEach(() => {
  eventBus.clear();
});

describe('EventBus 核心功能测试', () => {
  test('on 注册事件后，emit 能出发对应的回调函数', () =>
    new Promise((done, reject) => {
      const testCallback = (data: EventDetailType) => {
        try {
          const msg =
            typeof data.detail === 'object' && data.detail
              ? Reflect.get(data.detail, 'message')
              : '';

          expect(data).toEqual(testEventData);
          expect(msg).toBe(message);
          done();
        } catch (error) {
          reject(error);
        }
      };
      eventBus.on(eventName, testCallback);
      eventBus.emit(eventName, testEventData);
    }));

  test('同一事件可以注册多个回调，emit 会按顺序触发所有回调', () => {
    const mockCallback1 = rstest.fn();
    const mockCallback2 = rstest.fn();

    eventBus.on(eventName, mockCallback1);
    eventBus.on(eventName, mockCallback2);
    eventBus.emit(eventName, testEventData);

    expect(mockCallback1).toHaveBeenCalledTimes(1);
    expect(mockCallback1).toHaveBeenCalledWith(testEventData);
    expect(mockCallback2).toHaveBeenCalledTimes(1);
    expect(mockCallback2).toHaveBeenCalledWith(testEventData);
  });

  test('未注册的事件，emit 不会报错且无任何副作用', () => {
    const mockOnCallback = rstest.fn();
    const onSpy = rstest.spyOn(eventBus, 'on').mockImplementation(mockOnCallback);

    const emitEvent = () => {
      eventBus.emit(eventName, testEventData);
    };

    expect(emitEvent).not.toThrow();
    expect(mockOnCallback).toHaveBeenCalledTimes(0);

    // 重置
    onSpy.mockRestore();
    eventBus.clear();

    // 现在挂载事件
    eventBus.on(eventName, mockOnCallback);
    expect(emitEvent).not.toThrow();
    expect(mockOnCallback).toHaveBeenCalledTimes(1);
    expect(mockOnCallback).toHaveBeenCalledWith(testEventData);
  });

  test('同一回调不会重复被注册', () => {
    const mockCallback = rstest.fn();
    eventBus.on(eventName, mockCallback);
    eventBus.on(eventName, mockCallback);

    eventBus.emit(eventName, testEventData);
    expect(mockCallback).toHaveBeenCalledTimes(1);
  });

  test('off 传入回调，移除对应的事件监听', () => {
    const mockCallback1 = rstest.fn();
    const mockCallback2 = rstest.fn();

    // 添加回调
    eventBus.on(eventName, mockCallback1);
    eventBus.on(eventName, mockCallback2);
    eventBus.emit(eventName, testEventData);

    expect(mockCallback1).toHaveBeenCalledTimes(1);
    expect(mockCallback2).toHaveBeenCalledTimes(1);

    // 移除回调
    eventBus.off(eventName, mockCallback2);
    eventBus.emit(eventName, testEventData);

    expect(mockCallback1).toHaveBeenCalledTimes(2);
    expect(mockCallback2).toHaveBeenCalledTimes(1);
  });

  test('off 不传入回调，移除该事件所有监听', () => {
    const mockCallback1 = rstest.fn();
    const mockCallback2 = rstest.fn();

    // 添加回调
    eventBus.on(eventName, mockCallback1);
    eventBus.on(eventName, mockCallback2);
    eventBus.emit(eventName, testEventData);

    expect(mockCallback1).toHaveBeenCalledTimes(1);
    expect(mockCallback2).toHaveBeenCalledTimes(1);

    // 移除回调
    eventBus.off(eventName);

    expect(mockCallback1).toHaveBeenCalledTimes(1);
    expect(mockCallback2).toHaveBeenCalledTimes(1);
    expect(eventBus.has(eventName)).toBeFalsy();
  });

  test('off 不存在的事件，不会报错且无副作用', () => {
    const mockCallback = rstest.fn();
    const emitEvent = () => {
      eventBus.off(eventName, mockCallback);
    };

    expect(emitEvent).not.toThrow();
  });

  test('once 注册事件，触发后会自动从事件列表中删除', () => {
    const mockCallback = rstest.fn();
    eventBus.once(eventName, mockCallback);
    eventBus.emit(eventName, testEventData);
    eventBus.emit(eventName, testEventData);

    expect(mockCallback).toHaveBeenCalledTimes(1);
    expect(mockCallback).toHaveBeenCalledWith(testEventData);
    expect(eventBus.has(eventName)).toBeFalsy();
  });

  test('has 判断事件及回调是否存在', () => {
    const mockCallback1 = rstest.fn();
    const mockCallback2 = rstest.fn();
    expect(eventBus.has(eventName)).toBeFalsy();

    eventBus.on(eventName, mockCallback1);
    expect(eventBus.has(eventName)).toBeTruthy();
    expect(eventBus.has(eventName, mockCallback1)).toBeTruthy();
    expect(eventBus.has(eventName, mockCallback2)).toBeFalsy();

    eventBus.on(eventName, mockCallback2);
    expect(eventBus.has(eventName, mockCallback2)).toBeTruthy();
  });

  test('clear 清除所有事件', () => {
    const mockCallback1 = rstest.fn();
    const mockCallback2 = rstest.fn();
    expect(eventBus.has(eventName)).toBeFalsy();

    eventBus.on(eventName, mockCallback1);
    eventBus.on(eventName, mockCallback2);
    expect(eventBus.has(eventName)).toBeTruthy();

    eventBus.clear();
    expect(eventBus.has(eventName)).toBeFalsy();
  });
});
