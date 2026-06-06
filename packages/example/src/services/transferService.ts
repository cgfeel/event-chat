import { transferGroup } from '@/module/rpc/uitls'
import type { useEventChat } from '@event-chat/core'
import { createMessagePortRPC } from '@event-chat/rpc/messagePort'
import { createCtx } from '@event-chat/rpc/react'
import { receiptStore } from '@/components/chatLine/receiptStore'

export const messageCtx = createCtx((ctx: Partial<MessageCtxType>) => ({
  sendMessage: (msg: string) => ctx.print?.(msg),
}))

export const name = 'chat-message-port'

const getReceipt = () => {
  const receipt = receiptStore.addReceipt()
  receiptStore.increasing(receipt)
  return receipt
}

const readBlobToBase64 = (blob: Blob) =>
  new Promise<string>((resolve) => {
    const reader = new FileReader()
    reader.onload = () => {
      const { result } = reader
      resolve(typeof result === 'string' ? result : '不是有效的 Data URL')
    }

    reader.onerror = () => resolve('Base64 转换失败')
    reader.readAsDataURL(blob)
  })

const printImageBitmap = async (transfer: ImageBitmap) => {
  const canvas = new OffscreenCanvas(400, 300)
  const ctx = canvas.getContext('bitmaprenderer')
  ctx?.transferFromImageBitmap(transfer)

  const blob = await canvas.convertToBlob()
  return readBlobToBase64(blob)
}

const printMessagePort = (transfer: MessagePort) =>
  new Promise<string>((print) => {
    connectMessagePort(transfer)
    messageCtx.provider({ print })
  })

const printOffscreenCanvas = async (transfer: OffscreenCanvas) => {
  const ctx = transfer.getContext('2d')
  ctx?.fillRect(0, 0, 100, 100)

  const blob = await transfer.convertToBlob()
  return readBlobToBase64(blob)
}

const printReadableStream = <T>(
  transfer: ReadableStream<T>,
  emit: (itemData: [Transferable, Promise<string>] | null) => void
) => {
  const reader = transfer.getReader()
  const next = async () => {
    const { done, value } = await reader.read()
    if (done) return

    emit([transfer, Promise.resolve(String(value ?? ''))])
    next().catch(() => {})
  }

  next().catch(() => {})
  return null
}

export const connectMessagePort = (transfer: MessagePort) =>
  createMessagePortRPC(transfer, {
    context: {
      config: { channel: transferGroup },
      event: messageCtx.actions,
    },
  })

export const mainCtx = createCtx((ctx: Partial<MainCtxType>) => ({
  connectMedia: (data: MediaInfo) => {
    ctx.connectMedia?.(data)
  },
}))

export const parentCtx = createCtx(() => ({
  connectWritableStream: async (writable: WritableStream<WritableStreamData>) => {
    const writer = writable.getWriter()
    const generate = (message: string) => ({ date: new Date(), message })

    await writer.write(generate('write-1'))
    await writer.write(generate('write-2'))
    await writer.write(generate('write-3'))
    await writer.close()
  },
}))

export const transferCtx = createCtx((ctx: Partial<TransferCtxType>) => ({
  createWritableStream: () => {
    let user = ''
    const generate = <T extends Record<string, unknown> & { date?: Date }>(data: T) => ({
      ...data,
      date: data.date ? new Date(data.date) : new Date(),
      own: true,
      receipt: getReceipt(),
      user,
    })

    const writable = new WritableStream<WritableStreamData>({
      abort: (err: unknown) => {
        ctx.emit?.({
          detail: generate({ message: err instanceof Error ? err.message : 'write-abort' }),
          name,
        })
      },
      close: () => {
        ctx.emit?.({ detail: generate({ message: 'write-close' }), name })
      },
      async write(chunk) {
        ctx.emit?.({ detail: generate(chunk), name })
        await new Promise((reslove) => setTimeout(reslove, 1000))
      },
    })

    user = Object.prototype.toString.call(writable)
    ctx.connectWritableStream?.(writable)
  },
  sendMessage: ({ date, transfer }: MessageDataType, info) => {
    const { ports } = info ?? {}
    const mport = ports?.filter((item) => item instanceof MessagePort) ?? []
    const list = transfer ? [transfer].concat(mport) : mport

    const baseData = { own: true, receipt: getReceipt(), date }
    const runEmit = (itemData: [Transferable, Promise<string>] | null) => {
      const [item, result] = itemData ?? []
      if (item && result) {
        const user = Object.prototype.toString.call(item)
        result
          .then((message) => {
            const detail = { ...baseData, message, user }
            ctx.emit?.({ detail, name })
          })
          .catch(() => {})
      }
    }

    list
      .map((item): [Transferable, Promise<string>] | null => {
        if (item instanceof ImageBitmap) {
          return [item, printImageBitmap(item)]
        }
        if (item instanceof MediaSourceHandle) {
          const result = ctx.connectVideo?.(item) ?? null
          return result ? [item, result] : null
        }
        if (item instanceof MessagePort) {
          return [item, printMessagePort(item)]
        }
        if (item instanceof OffscreenCanvas) {
          return [item, printOffscreenCanvas(item)]
        }
        if (item instanceof ReadableStream) {
          // 由内部分批输出，所以这里返回 null
          return printReadableStream(item, runEmit)
        }
        return null
      })
      .forEach(runEmit)
  },
}))

export const workerCtx = createCtx((ctx: Partial<WorkerCtxType>) => ({
  createMediaSource: () => {
    // 从 worker 内部创建对象，这里是公共环境，MediaSource 不存在 handle
    ctx.connectMedia?.()
  },
}))

export type TransferCtxType = Pick<ReturnType<typeof useEventChat>, 'emit'> & {
  connectVideo: (transfer: MediaSourceHandle) => Promise<string> | null
  connectWritableStream: (writable: WritableStream<WritableStreamData>) => void
}

type MessageCtxType = { print: (msg: string) => void }
type MessageDataType = { date: Date; transfer?: Transferable }

type MainCtxType = { connectMedia: (data: MediaInfo) => void }
type MediaInfo = { compatible: boolean; media?: MediaSourceHandle }
type WorkerCtxType = { connectMedia: () => void }
type WritableStreamData = { date: Date; message: string }
