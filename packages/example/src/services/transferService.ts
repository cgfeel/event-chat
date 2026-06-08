import type { itemSchema } from '@/fields/chatField'
import { transferGroup } from '@/module/rpc/uitls'
import type { useEventChat } from '@event-chat/core'
import { createMessagePortRPC } from '@event-chat/rpc/messagePort'
import { createCtx } from '@event-chat/rpc/react'
import type z from 'zod'
import { receiptStore } from '@/components/chatLine/receiptStore'

export const messageCtx = createCtx((ctx: Partial<MessageCtxType>) => ({
  sendMessage: (message: string) => ctx.print?.({ message }),
}))

export const name = 'chat-message-port'

// 工具函数：AudioBuffer → WAV Blob
const bufferToWavBlob = (buffer: AudioBuffer) => {
  const length = buffer.length * buffer.numberOfChannels * 2
  const arrayBuffer = new ArrayBuffer(44 + length)
  const view = new DataView(arrayBuffer)
  const channels = []

  let offset = 0
  let pos = 0

  // 写入 WAV 头部
  const setUint16 = (data: number) => {
    view.setUint16(pos, data, true)
    pos += 2
  }

  const setUint32 = (data: number) => {
    view.setUint32(pos, data, true)
    pos += 4
  }

  setUint32(0x46464952)
  setUint32(36 + length)
  setUint32(0x45564157)
  setUint32(0x20746d66)
  setUint32(16)
  setUint16(1)
  setUint16(buffer.numberOfChannels)
  setUint32(buffer.sampleRate)
  setUint32(buffer.sampleRate * 2 * buffer.numberOfChannels)
  setUint16(buffer.numberOfChannels * 2)
  setUint16(16)
  setUint32(0x61746164)
  setUint32(length)

  // 写入 PCM 数据
  for (let i = 0; i < buffer.numberOfChannels; i++) {
    channels.push(buffer.getChannelData(i))
  }

  while (pos < 44 + length) {
    for (let i = 0; i < buffer.numberOfChannels; i++) {
      const sample = Math.max(-1, Math.min(1, channels[i][offset]))
      view.setInt16(pos, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true)
      pos += 2
    }
    offset++
  }

  return new Blob([view], { type: 'audio/wav' })
}

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

const printAudioData = async (transfer: AudioData) => {
  // 读取数据
  const data = new Float32Array(44100)
  transfer.copyTo(data, { planeIndex: 0 })

  // 生成 440Hz 声音
  for (let i = 0; i < data.length; i++) {
    data[i] = Math.sin((2 * Math.PI * 440 * i) / 44100)
  }

  // 创建音频缓冲区
  const audioContext = new AudioContext()
  await audioContext.resume()

  const buffer = audioContext.createBuffer(1, 44100, 44100)
  buffer.copyToChannel(data, 0)

  // 转换成 WAV 格式生成 URL
  const blob = bufferToWavBlob(buffer)
  return { audio: URL.createObjectURL(blob), message: 'create AudioData' }
}

const printImageBitmap = async (transfer: ImageBitmap) => {
  const canvas = new OffscreenCanvas(100, 100)
  const ctx = canvas.getContext('bitmaprenderer')
  ctx?.transferFromImageBitmap(transfer)

  const blob = await canvas.convertToBlob()
  return readBlobToBase64(blob).then((img) => ({ message: 'Img from ImageBitmap', img }))
}

const printMessagePort = (transfer: MessagePort) =>
  new Promise<ResultType>((print) => {
    connectMessagePort(transfer)
    messageCtx.provider({ print })
  })

const printOffscreenCanvas = async (transfer: OffscreenCanvas) => {
  const ctx = transfer.getContext('2d')
  ctx?.fillRect(0, 0, 100, 100)

  const blob = await transfer.convertToBlob()
  return readBlobToBase64(blob).then((img) => ({ message: 'Img from OffscreenCanvas', img }))
}

const printReadableStream = <T>(
  transfer: ReadableStream<T>,
  emit: (itemData: [Transferable, Promise<ResultType>] | null) => void
) => {
  const reader = transfer.getReader()
  const next = async () => {
    const { done, value } = await reader.read()
    if (done) return

    emit([transfer, Promise.resolve({ message: String(value ?? '') })])
    next().catch(() => {})
  }

  next().catch(() => {})
  return null
}

const printTransformStream = (transfer: TransformStream) =>
  new Promise<ResultType>((resolve) => {
    const source = new ReadableStream<string>({
      start(controller) {
        controller.enqueue('hello transformstream!')
        controller.close()
      },
    })

    let message = ''
    const sink = new WritableStream<string>({
      write(chunk) {
        message += chunk
      },
      close() {
        resolve({ message })
      },
    })

    source
      .pipeThrough(transfer)
      .pipeTo(sink)
      .catch(() => {})
  })

const printVideoFrame = (transfer: VideoFrame) =>
  new Promise<ResultType>((resolve) => {
    const canvas = new OffscreenCanvas(transfer.displayWidth, transfer.displayHeight)
    const ctx = canvas.getContext('2d')

    createImageBitmap(transfer)
      .then((bitmap) => {
        ctx?.drawImage(bitmap, 0, 0)
        bitmap.close()
      })
      .then(() => canvas.convertToBlob())
      .then((blob) => readBlobToBase64(blob))
      .then((img) => resolve({ message: 'create img from videoFrame', img }))
      .catch(() => {})
      .finally(() => {
        transfer.close()
      })
  })

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
    const runEmit = (itemData: [Transferable, Promise<ResultType>] | null) => {
      const [item, result] = itemData ?? []
      if (item && result) {
        const user = Object.prototype.toString.call(item)
        result
          .then((resultData) => {
            const detail = { ...baseData, ...resultData, user }
            ctx.emit?.({ detail, name })
          })
          .catch(() => {})
      }
    }

    list
      .map((item): [Transferable, Promise<ResultType>] | null => {
        if (item instanceof AudioData) {
          return [item, printAudioData(item)]
        }
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
        if (item instanceof TransformStream) {
          return [item, printTransformStream(item)]
        }
        if (item instanceof VideoFrame) {
          return [item, printVideoFrame(item)]
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
  connectVideo: (transfer: MediaSourceHandle) => Promise<ResultType> | null
  connectWritableStream: (writable: WritableStream<WritableStreamData>) => void
}

type MessageCtxType = { print: (result: ResultType) => void }
type MessageDataType = { date: Date; transfer?: Transferable }

type MainCtxType = { connectMedia: (data: MediaInfo) => void }
type MediaInfo = { compatible: boolean; media?: MediaSourceHandle }

type ResultType = Pick<z.infer<typeof itemSchema>, 'img' | 'message' | 'video'>

type WorkerCtxType = { connectMedia: () => void }
type WritableStreamData = { date: Date; message: string }
