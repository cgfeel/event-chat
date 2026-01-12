import { FormEmit } from '@/module/form';
import { FooterTips, FormUpdate, FormUpdateFields } from '@/module/form/FormModule';
import { Tag } from 'antd';
import type { FC } from 'react';
import Card from '@/components/Card';

const AntdForm: FC = () => (
  <div className="flex flex-col gap-16">
    <Card
      footer={
        <FooterTips>
          <Tag>antd</Tag> 的 <Tag>setFieldValue</Tag> 将作为手动更新，不会被 <Tag>dependencies</Tag>{' '}
          监听，而通过 <Tag>formEvent</Tag> 向受控字段通过 <Tag>emit</Tag> 触发更新，指定字段会通过{' '}
          <Tag>onChange</Tag> 模拟自然更新从而被精准捕获到更新
        </FooterTips>
      }
      title={
        <>
          <Tag>dependencies</Tag> 监听受控更新
        </>
      }
    >
      <FormEmit />
    </Card>
    <Card
      footer={
        <FooterTips>
          官方文档：<Tag>change</Tag> 事件仅当用户交互才会触发。该设计是为了防止在 <Tag>change</Tag>{' '}
          事件中调用 <Tag>setFieldsValue</Tag> 导致的循环问题。
          <ul className="list-disc m-4 text-gray-400 text-sm">
            <li>
              官方的建议是：通过 <Tag>useWatch</Tag> 实现字段监听，缺点是 <Tag>Form.List</Tag>{' '}
              动态删减字段时可能会引发报错，这个错误可能不是业务代码能够修复的，只能调整业务逻辑
            </li>
            <li>
              也可以通过 <Tag>shouldUpdate</Tag> 做全局更新，缺点是无法精准判断更新的具体字段
            </li>
          </ul>
          <Tag>emit</Tag> 允许被 <Tag>onFieldsChange</Tag> 和 <Tag>onValuesChange</Tag>{' '}
          监听到，但同样会将官方提出的问题暴露给业务方：
          <ul className="list-disc m-4 text-gray-400 text-sm">
            <li>
              在 <Tag>change</Tag> 内部需要避免循环更新，尤其是循环嵌套触发的更新
            </li>
            <li>这个问题业务可以在代码层面去做调整修复，而不会因为底层的限制需要调整业务逻辑</li>
            <li>优点是能够精准触发，监听更新的具体字段</li>
          </ul>
        </FooterTips>
      }
      title="监听表单数据更新"
    >
      <FormUpdate />
    </Card>
    <Card
      footer={
        <FooterTips>
          <Tag>Antd</Tag> 原有的 <Tag>setFieldsValue</Tag>{' '}
          只能主动更新指定值，字段不能被动更新。在表单项子组件中通过 <Tag>emit</Tag>{' '}
          向表单发起字段更新会被受控字段监听到。
        </FooterTips>
      }
      title="通过表单向指定字段发起更新"
    >
      <FormUpdateFields />
    </Card>
  </div>
);

export default AntdForm;
