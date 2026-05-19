// 记录所有消息的编号：每个线程下共用一套，比如主线程共用，worker 不同分支线程下分别一套
let record: Record<string, number> = {}
let listeners: Array<() => void> = []

function createId(): string {
  const id = crypto.randomUUID()
  return receiptStore.has(id) ? createId() : id
}

// 提供给 useSyncExternalStore 更新快照
const emitChange = () => {
  for (const listener of listeners) {
    listener()
  }
}

export const receiptStore = {
  // RPCAction 创建一个 ID 用于心跳处理，广播用于避免重新处理，在 destroy 的时候销毁
  // 消息用于全局请求 ID，用完即删（ID 留在消息中）
  create() {
    const id = createId()
    record = { ...record, [id]: 0 }

    emitChange()
    return id
  },
  getReceipt(id: string) {
    return id in record ? record[id] : -1
  },
  getSnapshot() {
    return record
  },
  // 按照逻辑，多个线程，多个实例下新增、删除会产生 key 撞库的可能
  // 这里采用了 crypto.randomUUID 保证撞库的概率极低，同时采用了 sing:requestId 作为广播的 key
  // 因此实际使用过程中几乎可能忽略不计
  increasing(id: string) {
    if (id in record) {
      record = { ...record, [id]: record[id] + 1 }
      emitChange()
    }
  },
  has(id: string) {
    return id in record
  },
  minus(id: string) {
    const num = receiptStore.getReceipt(id)
    if (num < 0) return
    if (num <= 1) {
      const newdata = { ...record }
      Reflect.deleteProperty(newdata, id)
      record = newdata
    } else {
      record = { ...record, [id]: num - 1 }
    }
    emitChange()
  },
  subscribe(listener: () => void) {
    listeners = [...listeners, listener]
    return () => {
      listeners = listeners.filter((l) => l !== listener)
    }
  },
}
