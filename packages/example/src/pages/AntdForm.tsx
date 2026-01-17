import {
  FooterTips,
  FormAsync,
  FormEmit,
  FormList,
  FormRate,
  FormSchema,
  FormUpdate,
  FormUpdateFields,
} from '@/module/form';
import FormAppend from '@/module/form/FormAppend';
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
          <ul className="m-4 list-disc text-sm text-gray-400">
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
          <ul className="m-4 list-disc text-sm text-gray-400">
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
    <Card
      footer={
        <FooterTips>
          设置列表项的具体值，并希望追踪更新的值做出相应的反应。<Tag>Antd</Tag>{' '}
          原有的能力需要根据业务逻辑挨个赋值，而 <Tag>emit</Tag>{' '}
          允许将赋值和受控分离开，当指定表单项更新后受控字段再做出反应。
        </FooterTips>
      }
      title="追踪列表项更新"
    >
      <FormList />
    </Card>
    <Card
      footer={
        <FooterTips>
          <div>
            通过 <Tag>Schema</Tag> 指定受控字段的类型，只有符合条件的消息会触发字段更新。同时提供{' '}
            <Tag>debug</Tag> 作为调试函数，用于收集未匹配的数据。
          </div>
          <div>
            这样 <Tag>Antd</Tag>{' '}
            表单字段实现了按照指定类型受控，一个字段可以在不同的业务场景下复用，而最终的交付结果一定是按照最初定义的{' '}
            <Tag>Schema</Tag> 相匹配。
          </div>
        </FooterTips>
      }
      title="指定受控类型"
    >
      <FormSchema />
    </Card>
    <Card
      footer={
        <FooterTips>
          <div>提供了 5 种方法用于数据类型转换，按照生命周期划分分别如下：</div>
          <ol className="m-4 list-decimal text-sm text-gray-400">
            <li>
              <Tag>ZodType.transform</Tag>：校验数据成功后转换数据，将结果通过 <Tag>onChange</Tag>{' '}
              发起更新
            </li>
            <li>
              <Tag>getValueFromEvent</Tag>：<Tag>Antd</Tag> 现有的属性，用于接收 <Tag>onChange</Tag>{' '}
              的值更新字段
            </li>
            <li>
              <Tag>normalize</Tag>：同 <Tag>getValueFromEvent</Tag>
            </li>
            <li>
              <Tag>FormItem.transform</Tag>：补充方法，仅用于通过 <Tag>schema</Tag>{' '}
              校验表单数据前转换用，不会改变字段值
            </li>
            <li>
              <Tag>getValueProps</Tag>：<Tag>Antd</Tag>{' '}
              现有的属性，用于将更新的数据转换成符合回显要求的数据
            </li>
          </ol>
          <div>根据自己的业务选择适合的方式，这里提供了 2 个演示：</div>
          <ul className="m-4 list-disc text-sm text-gray-400">
            <li>
              前提：不同的业务场景下，同类型字段组件，<Tag>emit</Tag>{' '}
              触发更新都是数字，不改组件，不改配置规则；
            </li>
            <li>第 1 个演示：怎么收集数据，怎么提交，但会把收集的数据重新转换成渲染匹配的数据；</li>
            <li>第 2 个演示：拿到数值，转换成渲染一致的格式提交；</li>
          </ul>
          <div>
            需要注意的是：<Tag>Form.List</Tag> 除了 <Tag>ZodType.transform</Tag>{' '}
            以外都不支持，为了减少业务的复杂度，不建议对 <Tag>Array</Tag>{' '}
            这样的字段类型做数据转换，可以对 <Tag>List</Tag> 下的 <Tag>Item</Tag> 做数据转换
          </div>
        </FooterTips>
      }
      title="转换字段数据进行渲染"
    >
      <FormRate />
    </Card>
    <Card
      footer={
        <FooterTips>
          <div>
            当提供 <Tag>schema</Tag> 后，会自动将其作为一项字段校验的 <Tag>Rule</Tag>{' '}
            添加到字段中。当前示例分别演示了：
          </div>
          <ul className="m-4 list-disc text-sm text-gray-400">
            <li>
              <Tag>pipe</Tag>：通过管道分段校验，中途错误将不再继续
            </li>
            <li>
              <Tag>async</Tag>：异步校验，当需要做异步校验时，字段的状态可以在 <Tag>refine</Tag>{' '}
              中定义
            </li>
          </ul>
        </FooterTips>
      }
      title="分段 + 异步验证自身字段"
    >
      <FormAsync />
    </Card>
    <Card>
      <FormAppend />
    </Card>
  </div>
);

export default AntdForm;
