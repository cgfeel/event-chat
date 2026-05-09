import { createContext } from 'react'

export const chatItem = 'chat-item'
export const chatName = 'chat'
export const iframeName = 'iframe'
export const GroupProvider = createContext({ group: iframeName })
export const workerGroup = 'worker-group'

// 避免 formily 对于 worker:item 这样匹配规则的问题
export const workerNameFilter = (name: string) => name.replace(/:/g, '-')
