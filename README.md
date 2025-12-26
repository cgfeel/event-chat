# 像聊天一样跨组建通信

- 提供一个自己的名字，和回调方法，`hooks` 会返回一个 `emit`
- 用 `emit` 可以向指定名称发送特定消息，任意组件也可以提供事件名用于接收消息
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

## 单元测试全覆盖

```shell
$ pnpm --filter @event-chat/core run test:all

> @event-chat/core@0.1.0 test:all /Volumes/develope/app/test/react-dev-exp/event-chat/packages/core
> tsd && rstest --coverage

  Rstest v0.7.2

 Coverage enabled with istanbul

 ✓ tests/eventBus.test.tsx (10)
 ✓ tests/index.test.tsx (4)
 ✓ tests/utils.test.tsx (10)
 ✓ tests/validate.test.tsx (9)
 ✓ tests/hooks.test.tsx (7)
 ✓ tests/emit.test.tsx (7)

 Test Files 6 passed
      Tests 47 passed
   Duration 3.42s (build 682ms, tests 2.74s)
```

## 特性

### 只接收指定类型的消息

这里通过 `Zod` 来实现，提供一个 `schema` 后只有类型匹配的消息才会被接收。如下：

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

> 消息尽管发，但 `callback` 接收到的一定是开始就约定好的结构和类型

`emit` 接受的参数类型如下：

- `detail`：要发送的消息内容，接收方如果有条件限制，消息的类型结构需要按照约定来
- `global`：群组会话发送公屏消息
- `name`：接收事件会话的名称
- `token`：私信令牌

### 异步消息

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

const { emit: groupEmit } = useEventChat('sub-mox', {
  group: 'form-detail-edit',
});

const { emit: outEmit } = useEventChat('out-mox');

groupEmit({ name: 'pub-mox' }); // ✅ 能够顺利发送
outEmit({ name: 'pub-mox' }); // ❎ 发送的消息收组内不到
```

对于组内的成员，如果需要在 “公屏” 喊话，调用 `emit` 时可以提供一个 `global`，比如上面的 `groupEmit` 可以这样：

```typescript
groupEmit({ global: true, name: 'pub-mox' });
```

那么非组内的 `pub-mox` 都可以接收到消息了。对于非组内成员，只能通过 `group` 设置成为组内成员才能相互通信，设计就是如此

### 私信

- 提供参数 `token: true` 后，将只接受 `emit` 时通过指定 `token` 发送的消息。
- 每次创建会话时 `token` 会连同 `emit` 一起返回
- 将拿到的 `token` 提供给消费方（例如：`props`、`context`...）

```typescript
const { token } = useEventChat('pub-mox', {
  token: true,
  callback: (record) => console.log('a----pub-mox', record),
});

const { emit } = useEventChat('sub-mox');
emit({ name: 'pub-mox', token });
```

### 调试

和 `callback` 一样，提供一个 `debug` 回调函数，将收集所有通过 `emit` 发送的，同名且未能触发事件的消息，例如：

```typescript
useEventChat('pub-mox', {
  group: 'form-detail-edit',
  callback: (record) => console.log('a----pub-mox', record),
  debug: (item, result) => console.log('a----pub-log', item, result),
});
```

参数 `item` 为发送的消息，类型 `unknown`，参数 `result` 的类型为：`ResultType | undefined`，来自 `safeParse` 得到的结果：

```typescript
type ResultType = z.ZodSafeParseResult<unknown>;
```

## 写在最后

### 实现原理

- 借助 `body` 做事件转发，通过 `eventBus` 执行监听和回调

### 设计初衷

- 跨组建通信，不受层级影响，通信不触发整个组件树 `rerender`
- 状态机也可以做到，但本着即用即走的思维，不会去为了通信去维护一个 `store`

### 启发

- 原本公司项目，想起 `jQuery` 时代事件委托流行过很久，自行研究 `pub-sub` 订阅模式，解决父子组件通信
- 这个模式借助了 `React` 合成事件冒泡，但有个缺点：只能子传父且需要借助额外的 `div` 捕获事件
- 后来想起 `React` 的合成事件都挂载在 `root` 上，于是我借助了 `body`（如三体借助太阳广播事件）
- 再后来想到，不能什么消息都接收，于是制定了：消息类型、异步、群组和私信

### `event-chat` 适用范围

- 适用，所有需要通过事件进行通信的情况，例如：点击、`observer`、`Promise` 响应（按情况）
- 不适用，初始数据保存和传递，通过条件判断已销毁或未挂载的组件
