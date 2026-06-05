/// <reference lib="webworker" />
import { mainCtx, workerCtx } from '@/services/transferService'
import { createDedicatedWorkerGlobalScopeRPC } from '@event-chat/rpc/dedicatedWorkerGlobalScope'
import { transferGroup } from '../uitls'

declare const self: DedicatedWorkerGlobalScope
declare global {
  interface MediaSource {
    readonly handle: MediaSourceHandle
  }
}

const target = self
const mediaSource = new MediaSource()

const [rpc] = createDedicatedWorkerGlobalScopeRPC(target, {
  context: {
    config: { channel: transferGroup },
    consume: mainCtx.actions,
    event: workerCtx.actions,
  },
})

mediaSource.addEventListener('sourceopen', () => {
  const sourceBuffer = mediaSource.addSourceBuffer('video/mp4; codecs="avc1.42E01E, mp4a.40.2"')
  sourceBuffer.addEventListener('updateend', () => {
    mediaSource.endOfStream()
  })

  fetch('/sample-320x240_new.mp4')
    .then((response) => response.arrayBuffer())
    .then((buffer) => sourceBuffer.appendBuffer(buffer))
    .catch(() => {})
})

workerCtx.provider({
  connectMedia: () => {
    const { handle } = 'handle' in mediaSource ? mediaSource : {}
    rpc
      .request('connectMedia', {
        payload: { compatible: Boolean(handle), media: handle },
        transfer: handle ? [handle] : [],
      })
      .catch(() => {})
  },
})

export {}
