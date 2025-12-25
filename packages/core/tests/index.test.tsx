import { describe, expect, test } from '@rstest/core';
import { useEventChat } from '../src/hooks';
import * as IndexExports from '../src/index';
import { createToken } from '../src/utils';

describe('index 出口文件导出验证', () => {
  test('正确导出 useEventChat', () => {
    expect(IndexExports.useEventChat).toBe(useEventChat);
    expect(IndexExports.useEventChat).toBeInstanceOf(Function);
  });

  test('正确导出 createToken', () => {
    expect(IndexExports.createToken).toBe(createToken);
    expect(IndexExports.createToken).toBeInstanceOf(Function);
  });
});
