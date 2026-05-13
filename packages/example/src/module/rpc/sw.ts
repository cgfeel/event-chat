/// <reference lib="webworker" />
import { mainCtx, workerCtx } from '@/services/serviceWorkerService'
import { createServiceWorkerGlobalScopeRPC } from '@event-chat/rpc/serviceWorkerGlobalScope'
import { serviceWorkerGroup } from './uitls'

declare const self: ServiceWorkerGlobalScope
const target = self

// console.log('a----type-1', typeof self.setInterval)

// sw.ts
// self.addEventListener('activate', (event) => {
//   // 强制接管所有打开的页面 ✅ 解决 clients 为空
//   // 强制新SW立即生效 ✅ 解决注销重注册后不生效
//   event.waitUntil(self.clients.claim())
// })

// self.addEventListener('message', () => {
//   // self.po
//   //   console.log('a---message in SW:', e.data, e.ports, e.source, self.registration.scope, 50)

//   self.clients
//     .matchAll({
//       type: 'window', // 只查页面
//       includeUncontrolled: true, // 强制获取所有页面（关键！）
//     })
//     .then((clients) => {
//       console.log(clients)
//       //   clients.forEach((client) => client.postMessage('a----test'))
//       //   console.log('a---client', clients) // 👈 现在一定有值！
//       //   console.log('发送消息的页面', e.source) // 这个永远有值
//     })
//     .catch(() => {})
// })

// self.setInterval(() => {
//   console.log('a---init')
// }, 1000)

const [rpc] = createServiceWorkerGlobalScopeRPC(target, {
  context: {
    // brodcast: workerChatCtx.brodcasts,
    config: { channel: serviceWorkerGroup },
    consume: mainCtx.actions,
    event: workerCtx.actions,
  },
})

workerCtx.provider({
  transmit: (payload) => {
    rpc
      .request('sendMessage', {
        transmit: () =>
          self.clients.matchAll({
            type: 'window',
            includeUncontrolled: true,
          }),
        payload,
      })
      .catch(() => {})
  },
})

// 将其当做 module，declare 只在当前有效
export {}
