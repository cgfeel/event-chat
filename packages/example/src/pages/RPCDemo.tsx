import { FooterTips } from '@/module/form'
import RecipientsProvider from '@/module/rpc/RecipientsProvider'
import { BroadcastChannelDemo } from '@/module/rpc/broadcastChannel'
import Iframe from '@/module/rpc/iframe'
import MessagePortDemo from '@/module/rpc/messagePort'
import ServiceWorkerDemo from '@/module/rpc/serviceWorker'
import SharedWorkerDemo from '@/module/rpc/sharedWorker'
import TransferDemo from '@/module/rpc/transfer'
import WorkerDemo from '@/module/rpc/webWorker'
import { Tag } from 'antd'
import type { FC } from 'react'
import Card from '@/components/Card'

const RPCDemo: FC = () => {
  return (
    <div className="flex flex-col gap-16">
      <RecipientsProvider>
        <Card
          footer={
            <FooterTips>
              <ul className="m-4 list-disc text-sm text-gray-400">
                <li>
                  <Tag>Window</Tag> 和 <Tag>iframe</Tag> 进行通行的时候，并不像 <Tag>Worker</Tag>{' '}
                  那样是 1 对 1 的实例，为了保持消息准确送达，会比较 <Tag>event.source</Tag>{' '}
                  和初始化时提供的 <Tag>target</Tag> 对象进行比较。
                </li>
                <li>
                  但是在 <Tag>iframe</Tag> 中所有初始对象都是 <Tag>Window.parent</Tag>，当{' '}
                  <Tag>Window.parent</Tag> 中存在多个相同上下文的实例时，就会引发重复请求；而{' '}
                  <Tag>iframe</Tag> 会收到第一条消息后结束后续响应，因此造成了请求竞态。
                </li>
                <li>
                  要解决竞态的方法之一就是使用不同的上下文（上下文提供的方法名不一样），但随着项目不断增加，很难确保每个上下文中的方法名唯一性。于是提供了更简单的方式，通过设置{' '}
                  <Tag>channel</Tag> 区别不同的实例通信，不同 <Tag>channel</Tag>{' '}
                  实例无法相互通信，但允许跨实例广播 <Tag>brodcastScope</Tag>。
                </li>
                <li>
                  通过 <Tag>channel</Tag> 创建的实例，可以通过 <Tag>RPC</Tag> 实例方法{' '}
                  <Tag>config</Tag> 重置，但为了便于开发和维护，不建议后期修改 <Tag>channel</Tag>
                  ；如果要动态配置 <Tag>channel</Tag>，可以通过动态创建组件 或 <Tag>url</Tag>{' '}
                  等方式，根据业务情况决定。
                </li>
              </ul>
            </FooterTips>
          }
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
          footer={
            <FooterTips>
              <ul className="m-4 list-disc text-sm text-gray-400">
                <li>
                  在网页主线程上下文中，无论是 <Tag>BroadcastChannel</Tag> 实例，还是{' '}
                  <Tag>Worker</Tag> 实例，<Tag>window</Tag>{' '}
                  实例，它们共享同一个线程。因此相同上下文的实例，它的上下文一定不能是一个固定的对象，而是类似于当前实例中，在组件内部通过方法{' '}
                  <Tag>generateMainCtx</Tag> 动态生成上下文。而分支线程，比如{' '}
                  <Tag>DedicatedWorkerGlobalScope</Tag> 内部，每个线程单独一个上下文，无需动态创建。
                </li>
              </ul>
            </FooterTips>
          }
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
                  由于 <Tag>ServiceWorkerGlobalScope</Tag> 有多种唤醒方式，而能够拿到具体{' '}
                  <Tag>Client</Tag> 的只有事件：<Tag>fetch</Tag> 和 <Tag>message</Tag>
                  ，其他事件无法拿到对应的 <Tag>client</Tag>，可以通过 <Tag>transmit</Tag>{' '}
                  自行匹或配唤醒 <Tag>WindowClient</Tag>
                </li>
                <li>
                  由于采用了共享实例通信的方式，会尽可能保证 <Tag>Service Worker</Tag>{' '}
                  的生命周期，但由于 <Tag>Service Worker</Tag>{' '}
                  自身特性，请勿相信永久保活，尤其是生产环境。在 <Tag>useRPC</Tag>{' '}
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
          title={
            <>
              <Tag>SharedWorker</Tag> + <Tag>MessagePort</Tag> 通信
            </>
          }
        >
          <SharedWorkerDemo />
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
                  需要注意的是，无论是 <Tag>BroadcastChannel</Tag> 实例，和 <Tag>Worker</Tag>{' '}
                  实例一样，在同一个网页主线程下共享同一个线程，因此需要业务动态生成上下文。
                </li>
                <li>
                  <Tag>BroadcastChannel</Tag> 不支持 <Tag>transfer</Tag>，但没有屏蔽该属性，因为{' '}
                  <Tag>brodcastScope</Tag> 会无差别转发当前线程下所有实例，包括{' '}
                  <Tag>BroadcastChannel</Tag>
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
      <RecipientsProvider>
        <Card
          footer={
            <FooterTips>
              <ul className="m-4 list-disc text-sm text-gray-400">
                <li>
                  <Tag>RPC</Tag> 实例允许通过 <Tag>request</Tag> 和 <Tag>broadcast</Tag> 转移{' '}
                  <Tag>transfer</Tag> 对象，由于 <Tag>broadcast</Tag> 属于广播，而{' '}
                  <Tag>transfer</Tag> 只允许单一转移，因此不建议通过 <Tag>broadcast</Tag> 转移对象
                </li>
                <li>
                  <Tag>RPC</Tag> 实例中保留了 <Tag>broadcast</Tag> 的 <Tag>transfer</Tag>{' '}
                  属性，因为接受广播的数量由业务决定，在允许的情况下确实可以用于转移{' '}
                  <Tag>transfer</Tag> 对象，但不建议这样使用。
                </li>
                <li>
                  <Tag>transfer</Tag> 是数组类型，允许同时转移多个对象
                </li>
                <li>
                  由于 <Tag>transfer</Tag> 只允许转移一次，一旦通过 <Tag>postMessage</Tag>{' '}
                  成功转移，将不允许再次转移。因此配置了 <Tag>transfer</Tag> 对象，将无视请求配置{' '}
                  <Tag>retry</Tag> 次数，如果需要可以通过 <Tag>retryTimeout</Tag> 延长请求过期时间。
                </li>
                <li>
                  不同的 <Tag>transfer</Tag>{' '}
                  对象，由于生命周期等问题，可能造成转移失败。对于转移失败的情况 <Tag>request</Tag>{' '}
                  请求会通过 <Tag>Promise.reject</Tag> 抛出异常，<Tag>broadcast</Tag>{' '}
                  接受一个参数方法 <Tag>fallback</Tag> 作为异常捕获的回调函数。
                </li>
                <li>
                  除此之外，对于没有收到消息的请求，可以通过 <Tag>debug</Tag>{' '}
                  作为配置方法，用于捕获收到的信息，自行判断问题。调试方法会将请求的数据，额外事件属性，配置属性，提供的上下文方请求名称，接受广播的数量等打印出来；开启调试方法后，可能接收到的信息会比较多，需要根据业务实际情况，自行添加筛选条件进行查找并做出判断。
                </li>
              </ul>
            </FooterTips>
          }
          title={
            <>
              <Tag>transfer</Tag> 转移对象
            </>
          }
        >
          <TransferDemo />
        </Card>
      </RecipientsProvider>
    </div>
  )
}

export default RPCDemo
