import { createCtx, createService } from '@event-chat/rpc/react'

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
    fetch('http://localhost:3000/api/health', {
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
      body: JSON.stringify(data),
    }).then((res) => res.json() as unknown as WorkerMessage),
}))

type IframeCtxType = {
  broadcast: (status: string) => void
}

type WorkerMessage = {
  message: string
  broadcast: string
}

export { iframeCtx, mainCtx, parentCtx, workerCtx }
