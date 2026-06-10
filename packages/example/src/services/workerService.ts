import { messageSchema } from '@/fields/chatField'
import { createCtx, createService } from '@event-chat/rpc'
import { type CtxType, baseChatServer, baseServer } from './baseService'

// messageSchema 不要通过 @/components/chatLine 加载，worker 进程不支持 React
const brodcastServer = (ctx: Partial<WorkerCtxType>) => ({
  receipt: (item: unknown) => {
    const { data, success } = messageSchema.safeParse(item)
    if (!success) return

    // 修改内容继续转发广播
    const suffix = ctx.page === 'root:worker' ? '' : ` (fw: ${ctx.getName?.() ?? '--'})`
    ctx.brodcastScope?.({
      payload: { ...data, message: `${data.message}${suffix}` },
    })
  },
})

const mainServer = (ctx: Partial<CtxType>) => ({
  ...baseServer(ctx),
  getRootUser: () => ({ id: 1, name: 'parentAdmin' }),
  // sendChat: (item: SendMessage) => mainChatServer(item, ctx),
})

const workerEvent = createService<WorkerCtxType>()

// 主线程的 event 必须每个 worker 同一个线程不能共享上下文
// 而 consume 线程不一样，自然隔离上下文不需要区分
const generateMainCtx = () => createCtx(mainServer, brodcastServer)

const mainCtx = createCtx(mainServer, brodcastServer)
const workerChatCtx = workerEvent(
  (ctx) => ({
    ...baseServer(ctx),
    changeName: (name: string) => {
      return ctx.updateName?.(name)
    },
    getUserInfo: () => ({
      name: ctx.getName?.() ?? ctx.name,
      page: ctx.page,
      status: 'success',
    }),
    getChildInfo: () => ({
      page: 'child-chat',
      status: 'success',
    }),
  }),
  brodcastServer
)

export { mainCtx, workerChatCtx, baseChatServer, generateMainCtx }

type WorkerCtxType = CtxType & {
  getName: () => string
  updateName: (name: string) => string
}
