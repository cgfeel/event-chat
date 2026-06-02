import { FooterTips } from '@/module/form'
import Iframe from '@/module/rpc/Iframe'
import RecipientsProvider from '@/module/rpc/RecipientsProvider'
import ServiceWorkerDemo from '@/module/rpc/ServiceWorkerDemo'
import WorkerDemo from '@/module/rpc/WorkerDemo'
import { BroadcastChannelDemo } from '@/module/rpc/broadcastChannel'
import { MessagePortDemo } from '@/module/rpc/messagePort'
import { Tag } from 'antd'
import type { FC } from 'react'
import Card from '@/components/Card'

const RPCDemo: FC = () => {
  return (
    <div className="flex flex-col gap-16">
      <RecipientsProvider>
        <Card
          title={
            <>
              <Tag>iframe</Tag> 通信演示
            </>
          }
        >
          <Iframe />
        </Card>
      </RecipientsProvider>
      <RecipientsProvider>
        <Card
          title={
            <>
              <Tag>Web Worker</Tag> 通信演示
            </>
          }
        >
          <WorkerDemo />
        </Card>
      </RecipientsProvider>
      <RecipientsProvider>
        <Card
          footer={
            <FooterTips>
              <ul className="m-4 list-disc text-sm text-gray-400">
                <li>
                  <Tag>Service worker</Tag> 每个 <Tag>Scope</Tag> 只能有一个 <Tag>active</Tag>{' '}
                  实例，为了让每个 <Tag>useRPC</Tag> 实例都能正常通信，相同 <Tag>Scope</Tag>{' '}
                  会共享同一个 <Tag>active</Tag> 实例通信，即便同域跨窗口也同样会共享实例
                </li>
                <li>
                  为了区分每条消息对应的请求方，在发起请求和广播的时候，内部会通过自带的{' '}
                  <Tag>requestId</Tag> 进行区分
                </li>
                <li>
                  为了确保广播的唯一性，允许在发送广播的时候提供 <Tag>requestId</Tag> 和{' '}
                  <Tag>sign</Tag> 作为转发的凭证
                </li>
                <li>
                  由于 <Tag>Service Worker</Tag> 自身的特性，允许同域同 <Tag>scope</Tag>{' '}
                  实例共享，因此发起消息请求时，允许通过 <Tag>transmit</Tag>{' '}
                  作为请求配置的方法，匹配一个或多个转发的 <Tag>WindowClient</Tag>
                </li>
                <li>
                  由于采用了共享实例通信的方式，会尽可能保证 <Tag>Service Worker</Tag>{' '}
                  的生命周期，但由于 <Tag>Service Worker</Tag>{' '}
                  自身特性，请勿相信永久保活，尤其是生产环境。于是 <Tag>useRPC</Tag>{' '}
                  的返回结果中，除了 <Tag>connected</Tag> 用于响应连接状态之外，还提供了{' '}
                  <Tag>start</Tag> 方法用于重启实例
                </li>
                <li>
                  除了 <Tag>start</Tag> 方法外，还提供了 <Tag>destroy</Tag>{' '}
                  用于手动注销实例，每个实例会随组件生命周期自动关闭；除非很了解生命周期，否则不建议手动，建议可以通过注销组件的方式注销实例
                </li>
              </ul>
            </FooterTips>
          }
          title={
            <>
              <Tag>Server Worker</Tag> 通信演示
            </>
          }
        >
          <ServiceWorkerDemo />
        </Card>
      </RecipientsProvider>
      <RecipientsProvider>
        <Card
          footer={
            <FooterTips>
              <ul className="m-4 list-disc text-sm text-gray-400">
                <li>
                  这个实例演示了通过 <Tag>MessagePort</Tag> 实现跨 <Tag>Window</Tag> 跨{' '}
                  <Tag>Worker</Tag> 通信。发起消息时，会将消息和 <Tag>Port</Tag> 一起发送给顶层{' '}
                  <Tag>Window</Tag> 主线程，和 <Tag>iframe</Tag> 所在的线程进行通信。
                </li>
                <li>
                  不要试图通过 <Tag>MessagePort</Tag>{' '}
                  在跨线程情况下保持长通信，因为线程的生命周期不受控制。
                </li>
                <li>
                  在 <Tag>Service Worker</Tag> 下为了保持通信能够顺利收到，在 <Tag>service</Tag>{' '}
                  方法中通过 <Tag>await</Tag> 的方式，等待 <Tag>MessagePort</Tag>{' '}
                  收到主线程发来的消息才会结束。这是 <Tag>@event-chat/rpc</Tag> 中{' '}
                  <Tag>Service Worker</Tag> 的特性
                </li>
              </ul>
            </FooterTips>
          }
          title={
            <>
              <Tag>MessagePort</Tag> 手动通信
            </>
          }
        >
          <MessagePortDemo />
        </Card>
      </RecipientsProvider>
      <RecipientsProvider>
        <Card
          footer={
            <FooterTips>
              <ul className="m-4 list-disc text-sm text-gray-400">
                <li>
                  这个实例演示了通过 <Tag>BroadcastChannel</Tag> 进行同域跨 <Tag>Window</Tag>{' '}
                  通信，演示中存在两个 <Tag>action</Tag> 实例，一个 <Tag>api</Tag> 实例，默认情况下{' '}
                  <Tag>Api</Tag> 需要点击 <Tag>Open</Tag> 按钮后，创建多个同 <Tag>channel</Tag>{' '}
                  实例才能正常通信。
                </li>
                <li>
                  由于 <Tag>BroadcastChannel</Tag> 本身用于广播，因此在 <Tag>useRPC</Tag> 中提供{' '}
                  <Tag>BroadcastChannel</Tag> 不支持通过 <Tag>request</Tag>{' '}
                  一对一发起请求，仅支持发起广播。
                </li>
                <li>
                  由于广播是同步发送消息，不支持异步获取返回发送消息结果，因此无论发送是否送达，不能通过广播方法本身获取，但允许业务通过消息发送的逻辑完成回执的过程。因此本实例所有已读均为
                  1，只做演示不是实际已读情况。
                </li>
                <li>
                  发送的消息可以通过 <Tag>RPC</Tag> 对象的 <Tag>broadcast</Tag> 向同{' '}
                  <Tag>channel</Tag> 实例发送广播，在示例中叫“全局转发“；也支持通过{' '}
                  <Tag>useRPC</Tag> 提供的 <Tag>brodcastScope</Tag>{' '}
                  向所有的实例对象转发消息，在示例中叫“全局广播“。
                </li>
                <li>
                  如果需要跨域可以通过 <Tag>iframe</Tag> 转发通信，上面演示已经展示不再重复演示。
                </li>
                <li>
                  需要注意的是，无论是 <Tag>BroadcastChannel</Tag> 实例，还是 <Tag>Worker</Tag>{' '}
                  实例，<Tag>window</Tag>{' '}
                  实例，在同一个网页主线程下，它们共享同一个线程。因此相同上下文的实例，它的上下文一定不能是一个固定的对象，而是类似于当前实例中，在组件内部通过方法{' '}
                  <Tag>generateBroadcastChannelCtx</Tag> 动态生成剩下文。而分支线程，比如{' '}
                  <Tag>Worker</Tag> 内部，每个线程单独一个上下文，无需动态创建
                </li>
              </ul>
            </FooterTips>
          }
          title={
            <>
              <Tag>BroadcastChannel</Tag> 广播
            </>
          }
        >
          <BroadcastChannelDemo />
        </Card>
      </RecipientsProvider>
    </div>
  )
}

export default RPCDemo
