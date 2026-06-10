import { type TransferCtxType, name, parentCtx, transferCtx } from '@/services/transferService'
import { useEventChat } from '@event-chat/core'
import { useRPC } from '@event-chat/rpc/react'
import { createWindowRPC } from '@event-chat/rpc/window'
import { type FC, useCallback } from 'react'
import { ChatScroll } from '@/components/chatLine'
import { allowedOrigins, transferGroup } from '../uitls'
import { panelStyles } from '../windowUitls'

const { logs } = panelStyles()

const WorkerLogs: FC = () => (
  <div className={logs()}>
    <ChatScroll direction="vertical" group={transferGroup} name={name} />
  </div>
)

const TransferItem: FC = () => {
  const { emit } = useEventChat('', { group: transferGroup })
  const { rpc } = useRPC({
    config: { channel: transferGroup, allowedOrigins },
    consume: parentCtx.actions,
    event: transferCtx.actions,
    drive: createWindowRPC,
    init: () => window.parent,
  })

  const connectVideo: TransferCtxType['connectVideo'] = useCallback((transfer) => {
    const video = document.createElement('video')
    video.controls = true
    video.srcObject = transfer

    return new Promise((resolve) => {
      video.onloadedmetadata = () => {
        try {
          const data = {
            duration: video.duration,
            height: video.height,
            readyState: video.readyState >= 2,
            width: video.videoWidth,
          }
          resolve({ message: JSON.stringify(data), video })
        } catch {
          resolve({ message: 'video metadata parse faild' })
        }
      }
    })
  }, [])

  const connectWebRTC: TransferCtxType['connectWebRTC'] = useCallback(
    (payload) => {
      rpc.request('connectWebRTC', { transfer: [payload], payload }).catch(() => {})
    },
    [rpc]
  )

  const connectWritableStream: TransferCtxType['connectWritableStream'] = useCallback(
    (payload) => {
      rpc.request('connectWritableStream', { transfer: [payload], payload }).catch(() => {})
    },
    [rpc]
  )

  transferCtx.provider({ connectVideo, connectWebRTC, connectWritableStream, emit })

  return (
    <div className="flex h-full bg-gray-800">
      <WorkerLogs />
    </div>
  )
}

export {}

export default TransferItem

declare global {
  interface HTMLVideoElement {
    srcObject: MediaSourceHandle | MediaProvider | null
  }
}
