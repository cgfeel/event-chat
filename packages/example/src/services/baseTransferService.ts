import { transferGroup } from '@/module/rpc/uitls'

const RTCConfig = { iceServers: [] }

// 工具函数：AudioBuffer → WAV Blob
export const bufferToWavBlob = (buffer: AudioBuffer) => {
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

// 创建本地 webRTC 信道
export const startConnection = (onmessage?: NonNullable<RTCDataChannel['onmessage']>) =>
  new Promise<RTCDataChannel>((resolve, reject) => {
    ;(async () => {
      try {
        // 创建本地 peer
        const localPeer = new RTCPeerConnection(RTCConfig)
        const remotePeer = new RTCPeerConnection(RTCConfig)

        // 创建数据通道（核心）
        const dataChannel = localPeer.createDataChannel(transferGroup, { ordered: true })

        // 通道打开返回 channel
        resolve(dataChannel)
        // dataChannel.onopen = () => resolve(dataChannel)

        // 收集 ICE 候选
        localPeer.onicecandidate = (event) => {
          if (event.candidate) remotePeer.addIceCandidate(event.candidate).catch(() => {})
        }

        // 创建 Offer
        const offer = await localPeer.createOffer()
        await localPeer.setLocalDescription(offer)

        // 接收方监听数据通道
        remotePeer.ondatachannel = (e) => {
          const receiveChannel = e.channel
          receiveChannel.onmessage = onmessage ?? null
        }

        // 接收方 ICE 候选
        remotePeer.onicecandidate = (event) => {
          if (event.candidate) localPeer.addIceCandidate(event.candidate).catch(() => {})
        }

        // 接收方设置 Offer
        if (localPeer.localDescription) {
          await remotePeer.setRemoteDescription(localPeer.localDescription)
        }

        // 接收方创建 Answer
        const answer = await remotePeer.createAnswer()
        await remotePeer.setLocalDescription(answer)

        // 发起方设置 Answer
        await localPeer.setRemoteDescription(answer)
      } catch (error) {
        reject(error instanceof Error ? error : new Error('startConnection faild'))
      }
    })().catch(() => {})
  })
