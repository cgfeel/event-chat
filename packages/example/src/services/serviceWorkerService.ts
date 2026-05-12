import { createCtx, createService } from '@event-chat/rpc/react'
import z from 'zod'

const URL =
  process.env.NODE_ENV !== 'production'
    ? '/'
    : 'https://m1.apifoxmock.com/m1/6364923-6061111-default/'

const requestSchema = z.object({
  broadcast: z.string(),
  message: z.string(),
  scope: z.string(),
})

const resultSchema = z.object({
  code: z.number(),
  data: z.object({
    date: z.iso.datetime().transform((str) => new Date(str)),
    id: z.number(),
    name: z.string(),
  }),
  message: z.string(),
  receivedBody: requestSchema.optional(),
})

const iframeEvent = createService<IframeCtxType>()

const iframeCtx = iframeEvent((ctx) => ({
  broadcast: (status: string) => ctx.broadcast?.(status),
}))

const mainCtx = createCtx(() => ({
  sendMessage: () => {},
}))

const parentCtx = createCtx(
  () => ({}),
  () => ({})
)

const workerCtx = createCtx(() => ({
  sendMessage: (data: WorkerMessage) =>
    fetch(`${URL}api/health`, {
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
      body: JSON.stringify(data),
    })
      .then((res) => res.json())
      .then((res) => {
        const { data: resData, error, success } = resultSchema.safeParse(res)
        return success
          ? {
              result: resData,
              message: 'success',
            }
          : {
              message: error.issues.slice(-1)[0].message,
              result: null,
            }
      }),
}))

type IframeCtxType = {
  broadcast: (status: string) => void
}

type WorkerMessage = z.infer<typeof requestSchema>

export { iframeCtx, mainCtx, parentCtx, workerCtx }
