import { afterEach, beforeEach, describe, expect, rstest, test } from '@rstest/core';
import { act, renderHook } from '@testing-library/react';
import eventBus from '../src/eventBus';
import { useEventChat } from '../src/hooks';
import { EventName, getEventName, mountEvent } from '../src/utils';

// 模拟 document.body.dispatchEvent
const mockDispatchEvent = rstest.fn();

beforeEach(() => {
  rstest.clearAllMocks();

  // 重置 eventBus 监听
  rstest.spyOn(eventBus, 'on').mockImplementation(() => {});
  rstest.spyOn(eventBus, 'off').mockImplementation(() => {});

  // 模拟 document.body.dispatchEvent
  rstest.spyOn(document.body, 'dispatchEvent').mockImplementation(mockDispatchEvent);

  // 重置 document.body
  Reflect.deleteProperty(document.body.dataset, 'globalIsListened');
});

afterEach(() => {
  rstest.restoreAllMocks();
});

describe('useEventChat 基础功能', () => {
  const testName = 'test-event-chat';

  test('返回有效的 token 字符串和 emit 函数', () => {
    const { result } = renderHook(() => useEventChat(testName));
    const { token, emit } = result.current;

    // 验证 token 是非空字符串
    expect(typeof token).toBe('string');
    expect(token).not.toBe('');
    expect(token).not.toBeNull();
    expect(token).not.toBeUndefined();

    // 验证 emit 是函数
    expect(emit).toBeInstanceOf(Function);
    expect(typeof emit).toBe('function');

    // 验证对象是否被冻结
    expect(Object.isFrozen(result.current)).toBe(true);
  });

  test('多次调用 Hook 应生成不同的 token', () => {
    const { result: result1 } = renderHook(() => useEventChat(testName));
    const { result: result2 } = renderHook(() => useEventChat(testName));
    const { result: result3 } = renderHook(() => useEventChat('another-event'));

    expect(result1.current.token).not.toBe(result2.current.token);
    expect(result1.current.token).not.toBe(result3.current.token);
  });

  test('emit 函数应正确创建并派发自定义事件', () => {
    const testDetail = {
      name: 'test-sub-event',
      detail: { message: 'hello' },
    };

    const { result } = renderHook(() =>
      useEventChat(testName, { group: 'test-group', type: 'test-type' })
    );

    // 测试副作用操作
    act(() => {
      result.current.emit(testDetail);
    });

    // 验证 dispatchEvent 被调用
    expect(mockDispatchEvent).toHaveBeenCalledTimes(1);
    const emittedEvent = mockDispatchEvent.mock.calls[0][0];

    // 检测调用的参数类型
    expect(emittedEvent).toBeInstanceOf(CustomEvent);
    expect(emittedEvent.type).toBe(EventName);

    // 检测 detail
    const detail = Reflect.get(emittedEvent, 'detail');
    expect(detail.origin).toBe(testName);
    expect(detail.group).toBe('test-group');
    expect(detail.type).toBe('test-type');
    expect(detail.name).toBe(testDetail.name);
    expect(detail.detail).toBe(testDetail.detail);
    expect(detail.id).toBeDefined();
  });

  test('emit 匿名事件', () => {
    const { result } = renderHook(() => useEventChat(''));
    const testDetail = {
      name: 'test-sub-event',
      detail: { message: 'hello' },
    };

    act(() => {
      result.current.emit(testDetail);
    });
    expect(mockDispatchEvent).toHaveBeenCalledTimes(1);

    const dispatchedEvent = mockDispatchEvent.mock.calls[0][0];
    expect(dispatchedEvent.detail.origin).toBe('');
  });

  test('Hooks 挂载时订阅 eventBus，卸载时取消订阅', () => {
    const { unmount } = renderHook(() => useEventChat(testName));
    const eventName = getEventName(testName);

    // 验证挂载时调用 eventBus.on: expect.any(String)
    expect(eventBus.on).toHaveBeenCalledWith(eventName, expect.any(Function));
    expect(eventBus.on).toHaveBeenCalledTimes(1);

    unmount();

    // 验证卸载时调用 eventBus.off
    expect(eventBus.off).toHaveBeenCalledWith(eventName, expect.any(Function));
    expect(eventBus.off).toHaveBeenCalledTimes(1);
  });

  test('事件名称为空时也会订阅回调', () => {
    renderHook(() => useEventChat(''));
    const eventName = getEventName('');

    expect(eventBus.on).toHaveBeenCalledWith(eventName, expect.any(Function));
  });

  test('document.body 只会添加一次全局 EventName 监听', () => {
    // 模拟 addEventListener
    const addEventListenerMock = rstest
      .spyOn(document.body, 'addEventListener')
      .mockImplementation(() => {});

    // 第一次渲染 Hook
    renderHook(() => useEventChat(testName));
    expect(addEventListenerMock).toHaveBeenCalledTimes(1);
    expect(addEventListenerMock).toHaveBeenCalledWith(EventName, mountEvent);
    expect(document.body.dataset.globalIsListened).toBe('1');

    // 第二次渲染 Hook，不会重复添加监听
    renderHook(() => useEventChat('another-test-name'));
    expect(addEventListenerMock).toHaveBeenCalledTimes(1);

    addEventListenerMock.mockRestore();
  });
});
