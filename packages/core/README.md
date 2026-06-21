# `useEventChat`: 组件通信 Hooks

<img height="144" width="464" alt="EventChatBgWhite" src="https://github.com/user-attachments/assets/db33f365-5abb-4041-a95c-fe3fe0acfa16" />

![License](https://img.shields.io/github/license/event-chat/event-chat) ![NPM
  Version](https://img.shields.io/npm/v/%40event-chat%2Fcore?label=%40event-char%2Fcore)
![GitHub Actions](https://github.com/event-chat/event-chat/actions/workflows/ci.yml/badge.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9+-3178c6) ![React](https://img.shields.io/badge/React-18+-3178c6)
![Zod](https://img.shields.io/badge/zod-3+-3178c6)

[![Repo Card](https://github-readme-stats.vercel.app/api/pin/?username=event-chat&repo=event-chat&theme=dracula)](https://github.com/event-chat/event-chat)

提供一个事件名和回调方法用于接收消息，同时返回一个 `emit` 用于向其事件名传递消息，无论组件层级都能传递信息，不会引发不必要的 `rerender`。

**适用范围**：所有事件通信，在 `React` 中可代替原生的 `addEventListener` 以及自身的合成事件

## 特性

- 跨组件通信的核心包，提供了：通信、调试、广播、群组、私信、异步消息，轻量级设计仅有几 kb
- 基于 `zod` 的 `Schema` 支持消息类型定义和校验，基于 `@formily/path` 支持事件名路径系统

## 快速上手

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
```
