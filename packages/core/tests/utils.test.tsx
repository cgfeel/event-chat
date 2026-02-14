import { beforeEach, describe, expect, rstest, test } from '@rstest/core'
import z from 'zod'
import eventBus from '../src/eventBus'
import {
  EventDetailType,
  EventName,
  combinePath,
  createEvent,
  createToken,
  getConditionKey,
  getEventName,
  isResultType,
  mountEvent,
} from '../src/utils'

const message = 'hello validation'
const name = 'test-event' as const
const config = {
  group: 'test-group',
  token: 'test-token-456',
}

const baseTestData: EventDetailType<{ message: string }> = {
  ...config,
  detail: { message },
  id: 'test-id-123',
  origin: 'test-origin',
  originName: 'test-origin',
  rule: name,
  time: new Date(),
  type: 'test-type',
  name,
}

const testSchema = z.object({ message: z.string() })

beforeEach(() => {
  rstest.clearAllMocks()
})

describe('工具函数单元测试', () => {
  test('EventName: 应该等于预设的自定义事件名称', () => {
    expect(typeof EventName).toBe('string')
    expect(EventName).not.toBe('')
  })

  test('createEvent: 正确配置的CustomEvent实例', () => {
    const event = createEvent(baseTestData)
    expect(event).toBeInstanceOf(CustomEvent)
    expect(event.type).toBe(EventName)
    expect(event.bubbles).toBeTruthy()
    expect(event.cancelable).toBeTruthy()
    expect(event.detail).toEqual(baseTestData)
  })

  test('createToken: 生成一个基于btoa编码的token字符串', () => {
    const testKey = 'test-key'
    const token = createToken(testKey)
    const decodedToken = window.atob(token)
    const [key, random, timestamp] = decodedToken.split(':')

    expect(key).toBe(testKey)
    expect(Number(random)).toBeGreaterThan(0)
    expect(Number(timestamp)).toBeLessThanOrEqual(Date.now())
    expect(typeof token).toBe('string')
  })

  test('getConditionKey: 过滤空值并以连字符拼接参数', () => {
    expect(getConditionKey('name', '123', 'type')).toBe('name-123-type')
    expect(getConditionKey('name', '123', '')).toBe('name-123')
    expect(getConditionKey('name', '123')).toBe('name-123')
    expect(getConditionKey('name', '', 'type')).toBe('name-type')
  })

  test('getEventName: 获取事件名', () => {
    expect(getEventName(['test'])).toBe('test')
    expect(getEventName('')).toBe('')
  })

  test('eventName 路径计算', () => {
    expect(getEventName('ab.cd.ef')).toBe(getEventName(['ab', 'cd', 'ef']))
    expect(getEventName('ab.0.ef')).toBe(getEventName(['ab', '0', 'ef']))
    expect(getEventName('.ab.0.ef')).toBe(getEventName(['', 'ab', '0', 'ef']))

    expect(getEventName('ab.cd.ef')).not.toBe(getEventName(['ab.cd', 'ef']))
    expect(getEventName('ab.0.ef')).not.toBe(getEventName(['ab', 0, 'ef']))

    expect(combinePath('.ab.0.ef', 'x.y.z')).toBe(getEventName(['x', 'y', 'ab', '0', 'ef']))
    expect(combinePath('..ab.0.ef', 'x.y.z')).toBe(getEventName(['x', 'ab', '0', 'ef']))
    expect(combinePath('...ab.0.ef', 'x.y.z')).toBe(getEventName(['ab', '0', 'ef']))
    expect(combinePath('....ab.0.ef', 'x.y.z')).toBe(getEventName(['ab', '0', 'ef']))

    expect(combinePath('.ab.0..ef', 'x.y.z')).toBe(getEventName(['x', 'y', 'ab', '0', 'ef']))
    // expect(combinePath('.ab.0..ef', 'x.y.z')).toBe(getEventName(['x', 'y', 'ab', 'ef']));
  })

  test('isResultType: 获取校验失败的对象', () => {
    const options = { group: 'test', schema: testSchema }
    const validResult = {
      success: false,
      error: { issues: [], name: 'ZodError' },
      data: null,
    }
    expect(isResultType(validResult)).toBeTruthy()
    expect(isResultType(options)).toBeFalsy()
    expect(isResultType({})).toBeFalsy()
    expect(isResultType({ success: true, data: 'test' })).toBeFalsy()
    expect(isResultType('string')).toBeFalsy()
    expect(isResultType(null)).toBeFalsy()
  })

  test('mountEvent: 通过 eventBus 发送事件', () => {
    const mockCallback = rstest.fn()
    const spyOn = rstest.spyOn(eventBus, 'emit').mockImplementation(mockCallback)
    const event = createEvent(baseTestData)

    mountEvent(event)
    expect(mockCallback).toHaveBeenCalledTimes(1)
    expect(mockCallback).toHaveBeenCalledWith(baseTestData)

    spyOn.mockRestore()
  })

  test('mountEvent: 当 name 为空时不会发送事件', () => {
    const mockCallback = rstest.fn()
    const spyOn = rstest.spyOn(eventBus, 'emit').mockImplementation(mockCallback)
    const event = createEvent({ ...baseTestData, rule: '' })

    mountEvent(event)
    expect(mockCallback).toHaveBeenCalledTimes(0)

    spyOn.mockRestore()
  })
})
