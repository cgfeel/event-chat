# `useEventChat`: 组件通信 Hooks

<img height="144" width="464" alt="EventChatBgWhite" src="https://github.com/user-attachments/assets/db33f365-5abb-4041-a95c-fe3fe0acfa16" />

![License](https://img.shields.io/github/license/event-chat/event-chat) ![NPM Version](https://img.shields.io/npm/v/%40event-chat%2Fantd-item?label=%40event-chat%2Frpc)
![GitHub Actions](https://github.com/event-chat/event-chat/actions/workflows/ci.yml/badge.svg) ![Tree Shaking](https://img.shields.io/badge/Tree%20Shaking-Supported-brightgreen)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9+-3178c6)

[![Repo Card](https://github-readme-stats.vercel.app/api/pin/?username=event-chat&repo=event-chat&theme=dracula)](https://github.com/event-chat/event-chat)

`@event-chat/rpc` 存在最大的意义在于，抹平了通信方式，让开发者从不同类型对象的收发消息中释放出来；转而只需要编写 `service` 上下文，从而更关注实际业务本身。

**特性：**

- 纯浏览器客户端 `RPC` 库，支持：`iframe`、`web worker`、`service worker`、`messagePort`、`shared worker`、`webSocket` (client)
- 提供心跳检测、消息发送、广播、多播，跨域、跨 `Window`、跨线程通信
- 开箱即用，提供 “上下文“ 即可通信，自动推导请求方法的参数类型和返回类型
- `Tree Shaking` 模式，根据通信的类型划分模块

## 安装

```shell
npm install @event-chat/rpc
```

## 快速上手

`@event-chat/rpc` 内部根据不同类型的通信已做了处理，业务使用时仅需提供上下文用于通信

```typescript
const parentCtx = createCtx(
  () => ({
    sendMessage: (msg: string) => {}, // 消息请求方法
  }),
  () => ({
    brodcast: () => {}, // 广播
  })
)

const iframeCtx = createCtx(() => ({
  sendMessage: (msg: string) => {},
}))
```

`Window` 父级绑定通信双方上下文、驱动函数、通信对象（跨域通信还需要提供允许的 `origin`）

```typescript
const ParentCom: FC = () => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const { connected, rpc } = useRPC({
    config: { allowedOrigins: ["*"], channel: "window-group" },
    brodcast: parentCtx.brodcasts,
    consume: iframeCtx.actions,
    event: parentCtx.actions,
    drive: createWindowRPC,
    init: () => iframeRef.current,
  });

  return (
    <>
      <iframe ref={iframeRef} src="/demo" />
      <button
        disabled={connected}
        type="button"
        onClick={() => {
          rpc.request("sendMessage", { payload: "test-demo" }).catch(() => {});
        }}
      >
        click it
      </button>
    </>
  );
};
```

`iframe` 通信双方上下文、驱动函数、通信对象

```typescript
const IframeCom: FC = () => {
  const { connected, rpc } = useRPC({
    config: { allowedOrigins: ["*"], channel: "window-group" },
    consume: parentCtx.actions,
    event: iframeCtx.actions,
    drive: createWindowRPC,
    init: () => window.parent,
  });

  return (
    <>
      <button
        disabled={connected}
        type="button"
        onClick={() => {
          // 发送消息
          rpc.request("sendMessage", { payload: "test-demo" }).catch(() => {});
        }}
      >
        click it
      </button>
      <button
        disabled={connected}
        type="button"
        onClick={() => {
          // 广播
          rpc.broadcast({ payload: "test-broadcast" });
        }}
      >
        brodcast
      </button>
    </>
  );
};
```

其他类型的通信方式和上方演示代码一样，详细见文档

https://event-chat.github.io/event-chat/
