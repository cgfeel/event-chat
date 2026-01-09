import { FooterTips, FormEmit, FormUpdate } from '@/module/FormModule';
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
    <Card title="监听表单数据更新">
      <FormUpdate />
    </Card>
  </div>
);

export default AntdForm;
