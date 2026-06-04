import { transferCtx } from '@/services/transferService'
import { useRPC } from '@event-chat/rpc/react'
import { createWindowRPC } from '@event-chat/rpc/window'
import { type FC, type PropsWithChildren, useCallback, useRef } from 'react'
import Button, { type ButtonProps } from '@/components/Button'
import { allowedOrigins, transferAction, transferGroup } from '../uitls'

const MessagePortBtn: FC<PropsWithChildren<TransferItemProps>> = ({
  children,
  disabled,
  onSubmit,
}) => (
  <Button
    disabled={disabled}
    onClick={() => {
      const channel = new MessageChannel()
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
        <Button disabled={!connected}>MediaSourceHandle</Button>
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
