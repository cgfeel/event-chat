# 像聊天一样跨组建通信 - 初稿

- 提供一个自己的名字，和回调方法，`hooks` 会返回一个 `emit`
- 用 `emit` 可以向指定名称发送特定消息，在任意地方也可以提供当前事件名，接收消息
- 无论是否是父子层级都能相互通信，不会引发不必要的 `rerender`

如下所示：

```typescript
const PubMox: FC = () => {
  const [emit] = useEventChat("pub-mox", {
    callback: (detail) => console.log("a----pub-mox", detail),
  });

  return (
    <button type="button" onClick={() => emit({ name: "sub-mox" })}>
      click it
    </button>
  );
};
```

```typescript
const SubMox: FC = () => {
  const [emit] = useEventChat("sub-mox", {
    callback: (detail) => console.log("a----sub-mox", detail),
  });

  return (
    <button type="button" onClick={() => emit({ name: "pub-mox" })}>
      click it
    </button>
  );
};
```
