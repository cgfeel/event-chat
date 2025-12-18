# 像聊天一样跨组建通信

- 提供一个自己的名字，和回调方法，`hooks` 会返回一个 `emit`
- 用 `emit` 可以向指定名称发送特定消息，在任意组件也可以提供事件名接收消息
- 无论是否是父子层级都能相互通信，不会引发不必要的 `rerender`

如下所示：

```typescript
const PubMox: FC = () => {
  const { emit } = useEventChat("pub-mox", {
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
  const { emit } = useEventChat("sub-mox", {
    callback: (detail) => console.log("a----sub-mox", detail),
  });

  return (
    <button type="button" onClick={() => emit({ name: "pub-mox" })}>
      click it
    </button>
  );
};
```

## 特性

### 只接收指定类型

那如何确定收到的消息是当前组件需要的？这里通过 `Zod` 来实现，提供一个 `schema` 后只有类型匹配的消息才会被接收。如下：

```typescript
const { emit } = useEventChat('pub-mox', {
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    ingredients: z.array(z.string()),
  }),
  callback: (record) => console.log('a----pub-mox', record),
});
```

上方 `callback` 中拿到的参数类型如下：

```typescript
(parameter) record: DetailType<"pub-mox", z.ZodObject<{
  title: z.ZodString;
  description: z.ZodOptional<z.ZodString>;
  ingredients: z.ZodArray<z.ZodString>;
}, z.core.$strip>>

type DetailType<Name extends string = string, Schema extends ZodType = ZodType> = {
  __origin: string;
  name: Name;
  detail?: z.infer<Schema>;
};
```

### 异步 Schema

对于 `Zod` 是允许异步校验的，这里通过 `async` 来实现，例如：

```typescript
const { emit } = useEventChat('pub-mox', {
  async: true,
  schema: z.string().refine(async (id) => {
    // verify that ID exists in database
    return true;
  }),
  callback: (record) => console.log('a----pub-mox', record),
});
```

### 群组消息

设置 `group` 后将只接受来自成员组的组内消息，例如：

```typescript
useEventChat('pub-mox', {
  group: 'form-detail-edit',
  callback: (record) => console.log('a----pub-mox', record),
});

const { emit: groupEmit } = useEventChat("sub-mox", {
  group: 'form-detail-edit',
  callback: (detail) => console.log("a----sub-mox", detail),
});

const { emit: outEmit } = useEventChat("out-mox", {
  callback: (detail) => console.log("a----sub-mox", detail),
});

groupEmit({ name: 'pub-mox' });  // ✅ 能够顺利发送
outEmit({ name: 'pub-mox' }); // ❎ 发送的消息收组内不到
```

对于组内的成员，如果需要在 “公屏” 喊话，调用 `emit` 时可以提供一个 `global`，比如上面的 `groupEmit` 可以这样：

```typescript
groupEmit({ global: true, name: 'pub-mox' });
```

那么非组内的 `pub-mox` 都可以接收到消息了。对于非组内成员，只能通过 `group` 设置成为组内成员才能相互通信，设计就是如此

### 私信
