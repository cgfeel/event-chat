# 像聊天一样本地通信

<img height="144" width="464" alt="EventChatBgWhite" src="https://github.com/user-attachments/assets/db33f365-5abb-4041-a95c-fe3fe0acfa16" />

![License](https://img.shields.io/github/license/event-chat/event-chat) ![NPM
  Version](https://img.shields.io/npm/v/%40event-chat%2Fcore?label=%40event-char%2Fcore) ![NPM
  Version](https://img.shields.io/npm/v/%40event-chat%2Fantd-item?label=%40event-chat%2Fantd-item)
![NPM Version](https://img.shields.io/npm/v/%40event-chat%2Fantd-item?label=%40event-chat%2Frpc)
![GitHub Actions](https://github.com/event-chat/event-chat/actions/workflows/ci.yml/badge.svg)
![Tree Shaking](https://img.shields.io/badge/Tree%20Shaking-Supported-brightgreen)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9+-3178c6)

[![Repo Card](https://github-readme-stats.vercel.app/api/pin/?username=event-chat&repo=event-chat&theme=dracula)](https://github.com/event-chat/event-chat)

`event-chat` 是一个本地通信的库，目前分别提供了 3 个独立的包，分别如下

## 特性

`@event-chat/core`:

- 跨组件通信的核心包，提供了：通信、调试、广播、群组、私信、异步消息，轻量级设计仅有几 kb
- 基于 `zod` 的 `Schema` 支持消息类型定义和校验，基于 `@formily/path` 支持事件名路径系统

`@event-chat/antd-item`:

- 基于 `antd` 结合 `@event-chat/core` 对 `Form` 表单系列组件的扩展，是 `zod` 对 `antd` 完美支持的实践
- 通过路径系统实现了 `antd` 对 `formily` 相互通信，扩展表单组件依赖更新，增加了相对路径匹配的能力

`@event-chat/rpc`:

- 纯客户端 `RPC` 库，支持 9 种类型对象通信，提供心跳、消息、广播、多播，跨域、跨线程通信，支持 `Tree Shaking`
- 抹平了通信方式，从开发消息收发转向通过“上下文“通信，聚焦业务本身

## 安装

3 个独立的包，可以根据需要选择安装

```shell
npm install @event-chat/core
npm install @event-chat/antd-item
npm install @event-chat/rpc
```

## 快速上手

`@event-chat/core` 通信

```tsx
const PubMox: FC = () => {
  const { emit } = useEventChat('pub-mox', {
    callback: (detail) => console.log(detail),
  })

  return (
    <button type="button" onClick={() => emit({ detail: 'form-pub', name: 'sub-mox' })}>
      click it
    </button>
  )
}

const SubMox: FC = () => {
  const { emit } = useEventChat('sub-mox', {
    callback: (detail) => console.log(detail),
  })

  return (
    <button type="button" onClick={() => emit({ detail: 'form-sub', name: 'pub-mox' })}>
      click it
    </button>
  )
}
```

`@event-chat/antd-item` 联动更新

```tsx
const fieldInput = ['target', 'input'] as const
const fieldOrigin = ['origin', 'input'] as const
const fieldRate = ['target', 'rate'] as const

const FormWrapper: FC = () => {
  const [formEvent] = FormEvent.useForm({ group: 'form-emit' })
  return (
    <div className="max-w-150">
      <FormEvent form={formEvent} labelCol={{ span: 8 }} wrapperCol={{ span: 16 }}>
        <FormEvent.Item label="主控表单" name={fieldOrigin}>
          <Input
            onChange={({ target }) => formEvent.emit({ detail: target.value, name: fieldInput })}
          />
        </FormEvent.Item>
        <FormEvent.Item
          label="受控表单"
          name={fieldInput}
          onChange={(rate, { emit }) => {
            emit({
              detail: !rate ? 0 : safetyPrint(rate).slice(-1).charCodeAt(0),
              name: fieldRate,
            })
          }}
        >
          <Input disabled />
        </FormEvent.Item>
        <FormEvent.Item name={fieldRate} hidden>
          <InputNumber />
        </FormEvent.Item>
        <Form.Item dependencies={[fieldRate]} label="受控响应">
          {(formIns) => {
            const value = (Number(formIns.getFieldValue(fieldRate) ?? 0) % 10) / 2
            return <RateInput value={value} />
          }}
        </Form.Item>
      </FormEvent>
    </div>
  )
}
```

`@event-chat/rpc` 本地通信

先定义 `service`

```tsx
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

在 `React` 中使用上下文发起通信

```tsx
const ParentCom: FC = () => {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const { connected, rpc } = useRPC({
    config: { allowedOrigins: ['*'], channel: 'window-group' },
    brodcast: parentCtx.brodcasts,
    consume: iframeCtx.actions,
    event: parentCtx.actions,
    drive: createWindowRPC,
    init: () => iframeRef.current,
  })

  return (
    <>
      <iframe ref={iframeRef} src="/demo" />
      <button
        disabled={connected}
        type="button"
        onClick={() => {
          rpc.request('sendMessage', { payload: 'test-demo' }).catch(() => {})
        }}
      >
        click it
      </button>
    </>
  )
}
```

详细文档以及在线演示请参考文档，这里提供简单的演示代码

https://event-chat.github.io/event-chat/

## 适用范围

`@event-chat/core`:

- 所有事件通信，在 `React` 中可代替原生的 `addEventListener` 以及自身的合成事件

`@event-chat/antd-item`:

- 为 `Antd` 的表单提供 `Schema` 类型校验能力
- 连接 `Antd` 和 `Formily`，明确分工职责，复杂交互由 `Formily` 处理，写业务可以不用管 `Formily` 的内部实现

`@event-chat/rpc`:

- 本地跨域、跨线程通信，可三方对接，减少线程通信心智负担聚焦业务本身

## 单元测试

```bash
Run pnpm --filter @event-chat/core test:all
  pnpm --filter @event-chat/core test:all
  pnpm --filter @event-chat/antd-item test:all
  shell: /usr/bin/bash -e {0}

> @event-chat/core@0.2.25 test:all /home/runner/work/event-chat/event-chat/packages/core
> tsd && rstest --coverage

  Rstest v0.7.2

 Coverage enabled with istanbul

 ✓ tests/eventBus.test.ts (10)
 ✓ tests/emit.test.ts (9)
 ✓ tests/emitPath.test.ts (4)
 ✓ tests/index.test.ts (5)
 ✓ tests/hooks.test.ts (7)
 ✓ tests/hooksExtra.test.ts (3)
 ✓ tests/validate.test.ts (17)
 ✓ tests/utils.test.ts (12)
 ✓ tests/namePath.test.ts (6)

 Test Files 9 passed
      Tests 73 passed
   Duration 7.01s (build 2.94s, tests 4.07s)

----------------|---------|----------|---------|---------|-------------------
File            | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s
----------------|---------|----------|---------|---------|-------------------
All files       |   96.23 |    86.45 |   97.91 |   96.87 |
 src            |      96 |    87.35 |   97.77 |   97.05 |
  eventBus.ts   |   95.65 |    84.61 |     100 |     100 | 26-33
  hooks.ts      |      96 |    81.25 |     100 |   97.91 | 99
  index.ts      |       0 |        0 |       0 |       0 |
  utils.ts      |      96 |    86.48 |     100 |   95.45 | 17,82
  validate.ts   |   96.29 |    95.23 |      90 |   95.65 | 64
 tests/fixtures |   97.22 |    77.77 |     100 |   95.83 |
  validate.ts   |   96.15 |    77.77 |     100 |   94.73 | 13
----------------|---------|----------|---------|---------|-------------------

> @event-chat/antd-item@0.3.25 test:all /home/runner/work/event-chat/event-chat/packages/antd-item
> tsd && rstest --coverage

  Rstest v0.7.2

 Coverage enabled with istanbul

 ✓ tests/FormInput.test.tsx (4)
 ✓ tests/FormContainer.test.tsx (4)
 ✓ tests/FormEvent.test.tsx (3)
  ✓ FormEvent > 测试 1：组件能正常渲染子组件 (346ms)
 ✓ tests/FormProvider.test.tsx (3)
 ✓ tests/FormList.test.tsx (5)
  ✓ FormList > 测试 1：组件能正常渲染列表中的子组件 (382ms)
 ✓ tests/FormItem.test.tsx (8)
 ✓ tests/utils.test.tsx (17)

 Test Files 7 passed
      Tests 44 passed
   Duration 11.9s (build 3.13s, tests 8.80s)

-------------------|---------|----------|---------|---------|-------------------
File               | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s
-------------------|---------|----------|---------|---------|-------------------
All files          |   96.77 |    76.28 |   90.41 |   96.35 |
 src               |   99.13 |    80.82 |   90.47 |   99.04 |
  ...Container.tsx |     100 |     62.5 |      80 |     100 | 5,29
  FormEvent.tsx    |     100 |    88.88 |      80 |     100 | 54
  FormInput.tsx    |     100 |    81.81 |     100 |     100 | 19-41
  FormItem.tsx     |   85.71 |      100 |   66.66 |   85.71 | 46
  FormList.tsx     |     100 |     62.5 |     100 |     100 | 10-44
  FormProvider.tsx |     100 |       50 |     100 |     100 | 34
  utils.ts         |     100 |    94.73 |   92.85 |     100 | 40
 tests/components  |   90.76 |     62.5 |   89.65 |      90 |
  Consumer.tsx     |   85.71 |      100 |     100 |   83.33 | 15
  CustomInput.tsx  |     100 |       50 |     100 |     100 | 12
  FormListDemo.tsx |     100 |    71.42 |     100 |     100 | 19-65
  RateInput.tsx    |   66.66 |       50 |      50 |   66.66 | 10-13,38-43
-------------------|---------|----------|---------|---------|-------------------
```
