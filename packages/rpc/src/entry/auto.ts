import { registerTransport } from '../core/registry'
import { WINDOW_NAME } from '../fields'

// 自动注册时 BroadcastChannel 逆变了，建议明确使用 BroadcastChannelTransport，或断言注册
registerTransport({
  name: 'broadcastChannel',
  in: () => typeof BroadcastChannel !== 'undefined',
  match: (t): t is BroadcastChannel => t instanceof BroadcastChannel,
  load: () => import('../transports/BroadcastChannelTransport'),
})

registerTransport({
  name: 'dedicatedWorkerGlobalScope',
  in: () => typeof DedicatedWorkerGlobalScope !== 'undefined',
  match: (t): t is DedicatedWorkerGlobalScope => t instanceof DedicatedWorkerGlobalScope,
  load: () => import('../transports/DedicatedWorkerGlobalScopeTransport'),
})

registerTransport({
  name: 'messagePort',
  in: () => typeof MessagePort !== 'undefined',
  match: (t): t is MessagePort => t instanceof MessagePort,
  load: () => import('../transports/MessagePortTransport'),
})

registerTransport({
  name: 'serviceWorkerGlobalScope',
  in: () => typeof ServiceWorkerGlobalScope !== 'undefined',
  match: (t): t is ServiceWorkerGlobalScope => t instanceof ServiceWorkerGlobalScope,
  load: () => import('../transports/ServiceWorkerGlobalScopeTransport'),
})

registerTransport({
  name: 'serviceWorkerRegistration',
  in: () => typeof ServiceWorkerRegistration !== 'undefined',
  match: (t): t is ServiceWorkerRegistration => t instanceof ServiceWorkerRegistration,
  load: () => import('../transports/ServiceWorkerRegistrationTransport'),
})

registerTransport({
  name: 'sharedWorker',
  in: () => typeof SharedWorker !== 'undefined',
  match: (t): t is SharedWorker => t instanceof SharedWorker,
  load: () => import('../transports/SharedWorkerTransport'),
})

registerTransport({
  name: 'SharedWorkerGlobalScope',
  in: () => typeof SharedWorkerGlobalScope !== 'undefined',
  match: (t): t is SharedWorkerGlobalScope => t instanceof SharedWorkerGlobalScope,
  load: () => import('../transports/SharedWorkerGlobalScopeTransport'),
})

registerTransport({
  name: 'webSocket',
  in: () => typeof WebSocket !== 'undefined',
  match: (t): t is WebSocket => t instanceof WebSocket,
  load: () => import('../transports/WebSocketTransport'),
})

registerTransport({
  name: 'window',
  in: () => typeof window !== 'undefined',
  match: (t): t is Window => String(t) === WINDOW_NAME,
  load: () => import('../transports/WindowTransport'),
})

registerTransport({
  name: 'worker',
  in: () => typeof Worker !== 'undefined',
  match: (t): t is Worker => t instanceof Worker,
  load: () => import('../transports/WorkerTransport'),
})

export { createRPC } from '../core/registry'
