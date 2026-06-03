import { transferCtx } from '@/services/transferService'
import { useRPC } from '@event-chat/rpc/react'
import { createWindowRPC } from '@event-chat/rpc/window'
import { type FC, type PropsWithChildren, useCallback, useRef } from 'react'
import Button, { type ButtonProps } from '@/components/Button'
import { allowedOrigins, transferAction, transferGroup } from '../uitls'

const OffscreenCanvas: FC<PropsWithChildren<TransferItemProps>> = ({
  children,
  disabled,
  onSubmit,
}) => (
  <Button
    disabled={disabled}
    onClick={() => {
      onSubmit?.(new MessageChannel().port1)
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
      rpc
        .request('sendMessage', {
          payload: transfer instanceof MessagePort ? {} : { transfer },
          transfer: [transfer],
        })
        .catch(() => {})
    },
    [rpc]
  )

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2">
        <OffscreenCanvas disabled={!connected} onSubmit={onSubmit}>
          OffscreenCanvas
        </OffscreenCanvas>
        <Button disabled={!connected}>ImageBitmap</Button>
        <Button disabled={!connected}>MessagePort</Button>
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
