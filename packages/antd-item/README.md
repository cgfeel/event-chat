# 扩展 `Antd` 表单组件，使其拥 `zod` 和 `@formily/path` 能力

<img height="144" width="464" alt="EventChatBgWhite" src="https://github.com/user-attachments/assets/db33f365-5abb-4041-a95c-fe3fe0acfa16" />

![License](https://img.shields.io/github/license/event-chat/event-chat) ![NPM
  Version](https://img.shields.io/npm/v/%40event-chat%2Fantd-item?label=%40event-chat%2Fantd-item)
![GitHub Actions](https://github.com/event-chat/event-chat/actions/workflows/ci.yml/badge.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9+-3178c6) ![React](https://img.shields.io/badge/React-18+-3178c6)
![Zod](https://img.shields.io/badge/zod-3+-3178c6)

[![Repo Card](https://github-readme-stats.vercel.app/api/pin/?username=event-chat&repo=event-chat&theme=dracula)](https://github.com/event-chat/event-chat)

用 `@event-chat/core` 扩展 `Antd` 的表单组件，使其拥有 `zod` 的 `schema` 能力，`Formily` 的 `NamePath` 能力。

场景：

- 字段 `B` 依赖字段 `A` 的响应结果做出反应
- 字段值要在不同业务交互下，调整配置的 `schema` 做出相应反馈
- 表单需要在不同的业务下，经过各自逻辑交付预期类型的数据

现有的 `antd` 有这么几个问题：

- 受控能力有限，不能对 `setFieldValue` 手动设置的值做出依赖监听
- 不同的业务场景下，一个组件需要写多套逻辑且不能复用
- 表单交互逻辑无法解耦，多个无关的 `state` 堆砌在一个组件中

`@event-chat/antd-item` 抽离表单的交互逻辑，解耦交互，让组件最小到字段去单独处理业务逻辑

## 安装

`@event-chat/antd-item` 允许单独安装，建议搭配 `zod` 和 `@event-chat/core`。

```shell
npm install zod # 可选
npm install @event-chat/core # 可选
npm install @event-chat/item
```

## 快速上手

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

## 单元测试

```bash
Run pnpm --filter @event-chat/antd-item test:all
  shell: /usr/bin/bash -e {0}

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
