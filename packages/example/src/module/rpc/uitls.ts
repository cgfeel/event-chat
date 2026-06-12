import { createContext } from 'react'

export const allowedOrigins = ['http://localhost:3000', '*']

export const chatItem = 'chat-item'
export const chatName = 'chat'
export const iframeName = 'iframe'
export const GroupProvider = createContext({ group: iframeName })

export const broadcastAction = 'broadcast-action'
export const broadcastApi = 'broadcast-api'
export const broadcastGroup = 'broadcast-group'

export const serviceScopeAction = '/static/js/async/action/'
export const serviceScopeApi = '/static/js/async/api/'
export const serviceScopeParent = '/static/js/async/'
export const serviceWorkerAction = 'service-worker-action'
export const serviceWorkerGroup = 'service-worker-group'
export const workerGroup = 'worker-group'

export const messageGroup = 'message-group'
export const messagePortService = '/static/js/async/port/service/'
export const messagePortWindow = '/static/js/async/port/window/'
export const messagePortWeb = '/static/js/async/port/web/'

export const sharedGroup = 'shared-group'
export const sharedWorkerAction = 'shared-worker-action'
export const sharedWorkerApi = 'shared-worker-api'

export const transferAction = 'transfer-action'
export const transferGroup = 'transfer-group'

// 避免 formily 对于 worker:item 这样匹配规则的问题
export const workerNameFilter = (name: string) => name.replace(/:/g, '-')
