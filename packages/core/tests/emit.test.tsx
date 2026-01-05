import { describe, expect, rstest, test } from '@rstest/core';
import { act, renderHook } from '@testing-library/react';
import z from 'zod';
import { useEventChat } from '../src';

const schema = z.object({
  age: z.number().min(0),
  email: z.email(),
  name: z.string(),
});

describe('useEventChat 通信', () => {
  test('回调处理应该触发回调函数 - 无 schema', async () => {
    const mockCallback = rstest.fn();
    renderHook(() => useEventChat('sub-mox', { callback: mockCallback }));

    const { result } = renderHook(() => useEventChat('pub-mox'));
    const record = {
      detail: { message: 'test' },
      name: 'sub-mox',
    };

    await act(() => {
      result.current.emit(record);
    });

    // 等待订阅者的 useEffect 执行完成（事件总线订阅生效）
    expect(mockCallback).toHaveBeenCalledTimes(1);
    expect(mockCallback).toHaveBeenCalledWith(expect.objectContaining(record));
  });

  test('事件名不匹配时不触发回调', async () => {
    const mockCallback = rstest.fn();
    renderHook(() => useEventChat('sub-mox', { callback: mockCallback }));

    const { result } = renderHook(() => useEventChat('pub-mox'));
    await act(() => {
      result.current.emit({ detail: { message: 'test' }, name: 'sub-mox-test' });
    });

    expect(mockCallback).not.toHaveBeenCalled();
  });

  test('Zod schema 验证-有效数据处理', async () => {
    const mockCallback = rstest.fn();
    renderHook(() => useEventChat('sub-schema', { callback: mockCallback, schema }));

    const { result } = renderHook(() => useEventChat('pub-schema'));
    const record = {
      detail: {
        age: 25,
        email: 'john@example.copm',
        name: 'John Doe',
      },
      name: 'sub-schema',
    };

    await act(() => {
      result.current.emit(record);
    });

    expect(mockCallback).toHaveBeenCalledTimes(1);
    expect(mockCallback).toHaveBeenCalledWith(expect.objectContaining(record));
  });

  test('Zod schema 验证-无效数据处理', async () => {
    const mockCallback = rstest.fn();
    renderHook(() =>
      useEventChat('sub-schema', {
        debug: mockCallback,
        schema,
      })
    );

    const { result } = renderHook(() => useEventChat('pub-schema'));
    const record = {
      detail: {
        age: -25,
        email: 'john@example.copm',
        name: 'nvalid-email',
      },
      name: 'sub-schema',
    };

    await act(() => {
      result.current.emit(record);
    });

    expect(mockCallback).toHaveBeenCalledTimes(1);
    expect(mockCallback).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        data: record.detail,
      })
    );
  });

  test('群发消息测试', async () => {
    const mockGroupCallback = rstest.fn();
    const mockGlobalCallback = rstest.fn();

    renderHook(() => useEventChat('sub-mox', { callback: mockGroupCallback, group: 'form-item' }));
    renderHook(() => useEventChat('sub-mox', { callback: mockGlobalCallback }));

    const { result } = renderHook(() => useEventChat('pub-mox', { group: 'form-item' }));
    const record = { name: 'sub-mox' };

    await act(() => {
      result.current.emit(record);
    });

    expect(mockGroupCallback).toHaveBeenCalledTimes(1);
    expect(mockGlobalCallback).toHaveBeenCalledTimes(0);

    // 追加一个群成员
    renderHook(() => useEventChat('sub-mox', { callback: mockGroupCallback, group: 'form-item' }));
    await act(() => {
      result.current.emit(record);
    });

    expect(mockGroupCallback).toHaveBeenCalledTimes(3);
    expect(mockGlobalCallback).toHaveBeenCalledTimes(0);

    // 向公屏发送消息
    await act(() => {
      result.current.emit({ ...record, global: true });
    });

    expect(mockGroupCallback).toHaveBeenCalledTimes(5);
    expect(mockGlobalCallback).toHaveBeenCalledTimes(1);
  });

  test('用 token 发送私信', async () => {
    const mockCallback = rstest.fn();
    const { result: subResult } = renderHook(() =>
      useEventChat('sub-mox', { token: true, callback: mockCallback })
    );

    const { result } = renderHook(() => useEventChat('pub-mox'));
    const record = { name: 'sub-mox' };

    // 没有提供 token
    await act(() => {
      result.current.emit(record);
    });

    expect(mockCallback).toHaveBeenCalledTimes(0);

    // 提供 token
    await act(() => {
      result.current.emit({ ...record, token: subResult.current.token });
    });

    expect(mockCallback).toHaveBeenCalledTimes(1);
  });

  test('options 变化时回调函数应该更新', async () => {
    const mockCallback1 = rstest.fn();
    const mockCallback2 = rstest.fn();

    const { result } = renderHook(() => useEventChat('pub-mox'));
    const { rerender } = renderHook(({ callback }) => useEventChat('sub-mox', { callback }), {
      initialProps: { callback: mockCallback1 },
    });

    // 第一次回调
    await act(() => {
      result.current.emit({ name: 'sub-mox' });
    });

    expect(mockCallback1).toBeCalledTimes(1);
    expect(mockCallback2).toBeCalledTimes(0);

    // 更新 props
    rerender({ callback: mockCallback2 });
    await act(() => {
      result.current.emit({ name: 'sub-mox' });
    });

    expect(mockCallback1).toBeCalledTimes(1);
    expect(mockCallback2).toBeCalledTimes(1);
  });

  test('回调函数接收的参数类型: 数据事件名', async () => {
    const name = ['sub-mox', 'list', 0, 'name'] as const;
    const origin = ['pub-mox', 0, 'test'] as const;
    const group = 'test-group';

    const mockCallback = rstest.fn();
    renderHook(() => useEventChat(name, { callback: mockCallback, group }));

    const { result } = renderHook(() => useEventChat(origin, { group }));
    const record = {
      detail: { message: 'test' },
      name,
    };

    await act(() => {
      result.current.emit(record);
    });

    expect(mockCallback).toHaveBeenCalledWith(
      expect.objectContaining({
        ...record,
        group,
        name,
        origin,
      })
    );
  });

  test('回调函数接收的参数类型: 字符事件名', async () => {
    const group = 'test-group';
    const mockCallback = rstest.fn();

    renderHook(() => useEventChat('sub-mox', { callback: mockCallback, group }));

    const { result } = renderHook(() => useEventChat('pub-mox', { group }));
    const record = {
      detail: { message: 'test' },
      name: 'sub-mox',
    };

    await act(() => {
      result.current.emit(record);
    });

    expect(mockCallback).toHaveBeenCalledWith(
      expect.objectContaining({
        ...record,
        name: 'sub-mox',
        origin: 'pub-mox',
        group,
      })
    );
  });
});
