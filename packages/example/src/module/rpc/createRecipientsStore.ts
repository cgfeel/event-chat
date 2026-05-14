import type { baseServer } from '@/services/iframeService'
import { type TargetInit, useRPC } from '@event-chat/rpc/react'
import { createContext, useContext, useSyncExternalStore } from 'react'

export function createRecipientsStore(): RecipientsStore {
  const currentRecipients = new Map<string, RecipientsRecord>()
  const pendingRPCList = new Set<RPCType>()

  let cachedSnapshot: SnapshotItem[] = []
  let listeners: Array<() => void> = []

  const computeSnapshot = () => {
    const next: SnapshotItem[] = []
    currentRecipients.forEach(({ online }, value) => {
      next.push({ disabled: !online, label: value, value })
    })

    if (
      next.length !== cachedSnapshot.length ||
      !next.every(
        (item, i) =>
          item.disabled === cachedSnapshot[i].disabled && item.value === cachedSnapshot[i].value
      )
    ) {
      cachedSnapshot = next
    }

    return cachedSnapshot
  }

  const emitChange = () => {
    for (const listener of listeners) {
      listener()
    }
  }

  return {
    get current() {
      return cachedSnapshot
    },
    addRecipient(rpc) {
      if (!pendingRPCList.has(rpc)) {
        pendingRPCList.add(rpc)
        setTimeout(() => {
          rpc
            .request('getUserInfo')
            .then((res) => {
              if (res.name) {
                currentRecipients.set(res.name, { rpc, online: true })
                computeSnapshot()
              }
              emitChange()
            })
            .catch(() => {})
        })
      }
    },
    delRecipient(rpc) {
      if (pendingRPCList.has(rpc)) {
        pendingRPCList.delete(rpc)
        currentRecipients.forEach((value, key) => {
          if (value.rpc === rpc) currentRecipients.set(key, { rpc, online: false })
        })
        computeSnapshot()
        emitChange()
      }
    },
    getRecipient(name) {
      return currentRecipients.get(name)?.rpc ?? null
    },
    getSnapshot() {
      return cachedSnapshot
    },
    subscribe(listener: () => void) {
      listeners = [...listeners, listener]
      return () => {
        listeners = listeners.filter((l) => l !== listener)
      }
    },
    updateRecipientName(rpc, name) {
      const [keyname, item] = currentRecipients.has(name)
        ? []
        : (Array.from(currentRecipients.entries()).find(([, i]) => Object.is(i.rpc, rpc)) ?? [])

      if (keyname !== undefined && keyname !== name && item) {
        currentRecipients.delete(keyname)
        currentRecipients.set(name, item)

        computeSnapshot()
        emitChange()
      }
    },
  }
}

export const StoreContext = createContext(createRecipientsStore())
export const useRecipients = () => {
  const store = useContext(StoreContext)
  const recipients = useSyncExternalStore(store.subscribe, store.getSnapshot)

  return [store, recipients] as const
}

type RecipientsStore = {
  current: SnapshotItem[]
  addRecipient: (rpc: RPCType) => void
  delRecipient: (rpc: RPCType) => void
  getRecipient: (name: string) => RPCType | null
  getSnapshot: () => SnapshotItem[]
  subscribe: (listener: () => void) => () => void
  updateRecipientName: (rpc: RPCType, name: string) => void
}

export type RPCType = ReturnType<typeof useRPC<TargetInit, ActionType, ActionType>>['rpc']

type ActionType = ReturnType<typeof baseServer>
type RecipientsRecord = {
  rpc: RPCType
  online: boolean
}

type SnapshotItem = {
  disabled: boolean
  label: string
  value: string
}
