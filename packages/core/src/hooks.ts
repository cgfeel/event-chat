import { useCallback, useEffect, useId, useMemo, useRef } from 'react'
import { ZodType } from 'zod'
import eventBus from './eventBus'
import {
  EventChatOptions,
  EventDetailType,
  EventName,
  ExcludeKey,
  NamepathType,
  combinePath,
  createEvent,
  createToken,
  getConditionKey,
  getEventName,
  isResultType,
  mountEvent,
} from './utils'
import { checkLiteral, validate } from './validate'

export const useMemoFn = <T>(fn: T) => {
  const methodRef = useRef<T>(fn)
  methodRef.current = fn

  return useMemo(
    () => ({
      get current() {
        return methodRef.current
      },
    }),
    []
  )
}

export function useEventChat<
  Name extends NamepathType,
  Schema extends ZodType | undefined = undefined,
  Group extends string | undefined = undefined,
  Type extends string | undefined = undefined,
  Token extends boolean | undefined = undefined,
>(name: Name, ops?: EventChatOptions<Name, Schema, Group, Type, Token>) {
  const eventName = useMemo(() => getEventName(name), [name])
  const id = useId()

  // 随业务改变
  const token = useMemo(
    () => createToken(getConditionKey(eventName, id, ops?.type)),
    [eventName, id, ops?.type]
  )

  const nameRc = useMemoFn(name)
  const options = useMemoFn(ops)
  const tokenRc = useMemoFn(token)

  const errorHandle = useCallback(
    (error: unknown, data: EventDetailType) => {
      const { debug } = options.current ?? {}
      if (error instanceof Error && debug) {
        const cause = isResultType(error.cause) ? error.cause : undefined
        debug?.({ ...cause, status: 'invalid', data })
      }
    },
    [options]
  )

  const getResult = useCallback(() => {
    const { group, debug } = options.current ?? {}
    return [{ origin: nameRc.current, time: new Date(), group, id }, debug] as const
  }, [id, nameRc, options])

  const callbackHandle = useCallback(
    (data: EventDetailType) => {
      const opitem = options.current
      const upRecord = { ...data, name: nameRc.current, type: opitem?.type }

      if (!opitem) return
      const throwError = (error: unknown) => errorHandle(error, data)

      if (opitem.schema !== undefined) {
        validate(upRecord, { ...opitem, schema: opitem.schema }, tokenRc.current)
          .then(opitem.callback)
          .catch(throwError)
      } else {
        checkLiteral(upRecord, { ...opitem, schema: undefined }, tokenRc.current)
          .then(opitem.callback)
          .catch(throwError)
      }
    },
    [nameRc, options, tokenRc, errorHandle]
  )

  const emit = useCallback(
    <Detail, CustomName extends NamepathType>(
      detail: Omit<EventDetailType<Detail, CustomName>, ExcludeKey>
    ) => {
      const [data, debug] = getResult()
      const current = { ...detail, ...data, originName: detail.name, rule: '' }
      try {
        current.rule = combinePath(detail.name, data.origin)
        const event = createEvent(current)

        debug?.({ data: event.detail, status: 'emit' })
        document.body.dispatchEvent(event)
      } catch (error) {
        debug?.({ data: current, lost: error, status: 'lost' })
      }
    },
    [getResult]
  )

  useEffect(() => {
    if (!document.body.dataset.globalIsListened) {
      document.body.addEventListener(EventName, mountEvent)
      document.body.dataset.globalIsListened = '1'
    }
  }, [])

  useEffect(() => {
    const [data, debug] = getResult()
    debug?.({ data: { ...data, name: origin }, status: 'init' })
  }, [getResult])

  useEffect(() => {
    eventBus.on(eventName, callbackHandle)
    return () => {
      eventBus.off(eventName, callbackHandle)
    }
  }, [eventName, callbackHandle])

  return Object.freeze({ token, emit })
}
