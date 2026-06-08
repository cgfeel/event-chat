import { mainCtx, messageCtx, parentCtx, transferCtx, workerCtx } from '@/services/transferService'
import { useEventChat } from '@event-chat/core'
import { createMessagePortRPC } from '@event-chat/rpc/messagePort'
import { useRPC } from '@event-chat/rpc/react'
import { createWindowRPC } from '@event-chat/rpc/window'
import { createWorkerRPC } from '@event-chat/rpc/worker'
import { Tooltip } from 'antd'
import { type FC, type PropsWithChildren, useCallback, useRef } from 'react'
import Button, { type ButtonProps } from '@/components/Button'
import { toastOpen } from '@/utils/event'
import { allowedOrigins, transferAction, transferGroup } from '../uitls'

// import { waitVideoReady } from './units'

const AudioDataBtn: FC<PropsWithChildren<TransferItemProps>> = ({
  children,
  disabled,
  onSubmit,
}) => (
  <Button
    disabled={disabled}
    onClick={() =>
      onSubmit?.(
        new AudioData({
          format: 'f32-planar',
          sampleRate: 44100,
          numberOfChannels: 1,
          numberOfFrames: 44100,
          timestamp: 0,
          data: new Float32Array(44100),
        })
      )
    }
  >
    {children}
  </Button>
)

const MediaSourceHandleBtn: FC<PropsWithChildren<TransferItemProps>> = ({
  children,
  disabled,
  onSubmit,
}) => {
  const { connected, rpc } = useRPC({
    config: { channel: transferGroup },
    consume: workerCtx.actions,
    event: mainCtx.actions,
    drive: createWorkerRPC,
    init: () =>
      new Worker(new URL('./worker.ts', import.meta.url), {
        name: 'transfer-worker',
      }),
  })

  const { emit } = useEventChat('')
  mainCtx.provider({
    connectMedia: ({ compatible, media }) => {
      if (!compatible) {
        emit({
          detail: {
            message: '当前浏览器不支持: MediaSourceHandle',
            title: `转移对象失败`,
            type: 'error',
          },
          name: toastOpen,
        })
        return
      }

      if (media) onSubmit?.(media)
    },
  })

  return (
    <Button
      disabled={!(!disabled && connected && Boolean(MediaSource.canConstructInDedicatedWorker))}
      onClick={() => {
        rpc.request('createMediaSource').catch(() => {})
      }}
    >
      {children}
    </Button>
  )
}

const MessagePortBtn: FC<PropsWithChildren<TransferItemProps>> = ({
  children,
  disabled,
  onSubmit,
}) => (
  <Button
    disabled={disabled}
    onClick={() => {
      const channel = new MessageChannel()
      const [rpc] = createMessagePortRPC(channel.port1, {
        context: {
          config: {
            channel: transferGroup,
            onConnect: () => {
              rpc.request('sendMessage', { payload: 'msg-from-main-messageport' }).catch(() => {})
            },
          },
          consume: messageCtx.actions,
        },
      })
      onSubmit?.(channel.port2)
    }}
  >
    {children}
  </Button>
)

const OffscreenCanvasBtn: FC<PropsWithChildren<TransferItemProps & { bitmap?: boolean }>> = ({
  bitmap,
  children,
  disabled,
  onSubmit,
}) => (
  <Button
    disabled={disabled}
    onClick={() => {
      const canvas = new OffscreenCanvas(100, 100)
      if (!bitmap) return onSubmit?.(canvas)

      const ctx = canvas.getContext('2d')
      ctx?.fillRect(0, 0, 100, 100)

      const bitmapData = canvas.transferToImageBitmap()
      onSubmit?.(bitmapData)
    }}
  >
    {children}
  </Button>
)

const ReadableStreamBtn: FC<PropsWithChildren<TransferItemProps>> = ({
  children,
  disabled,
  onSubmit,
}) => (
  <Button
    disabled={disabled}
    onClick={() => {
      onSubmit?.(
        new ReadableStream({
          start(controller) {
            let count = 0
            controller.enqueue(`message-${count++}: ${Date.now()}`)

            const timer = setInterval(() => {
              controller.enqueue(`message-${count++}: ${Date.now()}`)
              if (count >= 5) {
                clearInterval(timer)
                controller.close()
              }
            }, 1000)
          },
        })
      )
    }}
  >
    {children}
  </Button>
)

const TransformStreamBtn: FC<PropsWithChildren<TransferItemProps>> = ({
  children,
  disabled,
  onSubmit,
}) => (
  <Button
    disabled={disabled}
    onClick={() => {
      const upperCaseTransform = new TransformStream<string, string>({
        transform(chunk, controller) {
          const upperChunk = chunk.toUpperCase()
          controller.enqueue(upperChunk)
        },
      })
      onSubmit?.(upperCaseTransform)
    }}
  >
    {children}
  </Button>
)

const VideoFrameBtn: FC<PropsWithChildren<TransferItemProps>> = ({
  children,
  disabled,
  onSubmit,
}) => (
  <Button
    disabled={disabled}
    onClick={() => {
      const video = document.createElement('video')
      video.src = '/sample-320x240_new.mp4'
      video.muted = true
      video
        .play()
        .then(() => {
          const frame = new VideoFrame(video, { timestamp: 0 })
          onSubmit?.(frame)
        })
        .catch(() => {})
    }}
  >
    {children}
  </Button>
)

const WritableStreamBtn: FC<
  PropsWithChildren<
    Omit<TransferItemProps, 'onSubmit'> & {
      onSubmit?: () => void
    }
  >
> = ({ children, disabled, onSubmit }) => (
  <Button disabled={disabled} onClick={onSubmit}>
    {children}
  </Button>
)

const TransferDemo: FC = () => {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const { connected, rpc } = useRPC({
    config: { channel: transferGroup, allowedOrigins },
    consume: transferCtx.actions,
    event: parentCtx.actions,
    drive: createWindowRPC,
    init: () => iframeRef.current,
  })

  const onSubmit = useCallback(
    (transfer: Transferable) => {
      const date = new Date()
      rpc
        .request('sendMessage', {
          payload: transfer instanceof MessagePort ? { date } : { date, transfer },
          transfer: [transfer],
        })
        .catch(() => {})
    },
    [rpc]
  )

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2">
        <OffscreenCanvasBtn disabled={!connected} onSubmit={onSubmit}>
          OffscreenCanvas
        </OffscreenCanvasBtn>
        <OffscreenCanvasBtn disabled={!connected} onSubmit={onSubmit} bitmap>
          ImageBitmap
        </OffscreenCanvasBtn>
        <MessagePortBtn disabled={!connected} onSubmit={onSubmit}>
          MessagePort
        </MessagePortBtn>
        <Tooltip title="仅支持：Chrome 108+、Edge 108+、Opera 94+、Safari 18+">
          <span>
            <MediaSourceHandleBtn disabled={!connected} onSubmit={onSubmit}>
              MediaSourceHandle
            </MediaSourceHandleBtn>
          </span>
        </Tooltip>
        <Tooltip title="会分段发送 5 条消息">
          <span>
            <ReadableStreamBtn disabled={!connected} onSubmit={onSubmit}>
              ReadableStream
            </ReadableStreamBtn>
          </span>
        </Tooltip>
        <Tooltip title="会分段发送 3 条消息">
          <span>
            <WritableStreamBtn
              disabled={!connected}
              onSubmit={() => {
                rpc.request('createWritableStream').catch(() => {})
              }}
            >
              WritableStream
            </WritableStreamBtn>
          </span>
        </Tooltip>
        <TransformStreamBtn disabled={!connected} onSubmit={onSubmit}>
          TransformStream
        </TransformStreamBtn>
        <AudioDataBtn disabled={!connected} onSubmit={onSubmit}>
          AudioData
        </AudioDataBtn>
        <VideoFrameBtn disabled={!connected} onSubmit={onSubmit}>
          VideoFrame
        </VideoFrameBtn>
        <Button disabled={!connected}>RTCDataChannel</Button>
        <Button disabled={!connected}>ArrayBuffer</Button>
      </div>
      <iframe className="h-56" ref={iframeRef} src={`/iframe?sub=${transferAction}`} />
    </div>
  )
}

export default TransferDemo

interface TransferItemProps extends Pick<ButtonProps, 'disabled'> {
  onSubmit?: (transfer: Transferable) => void
}
