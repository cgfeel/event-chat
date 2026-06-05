import { mainCtx, messageCtx, transferCtx, workerCtx } from '@/services/transferService'
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
      const canvas = new OffscreenCanvas(400, 300)
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

const TransferDemo: FC = () => {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const { connected, rpc } = useRPC({
    config: { channel: transferGroup, allowedOrigins },
    consume: transferCtx.actions,
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
        <Tooltip title="仅支持：Chrome 90+、Edge 90+、Opera 76+">
          <MediaSourceHandleBtn disabled={!connected} onSubmit={onSubmit}>
            MediaSourceHandle
          </MediaSourceHandleBtn>
        </Tooltip>
        <Button disabled={!connected}>ReadableStream</Button>
        <Button disabled={!connected}>WritableStream</Button>
        <Button disabled={!connected}>TransformStream</Button>
        <Button disabled={!connected}>AudioData</Button>
        <Button disabled={!connected}>VideoFrame</Button>
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
