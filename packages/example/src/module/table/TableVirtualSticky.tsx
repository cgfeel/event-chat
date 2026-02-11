import { Tag } from 'antd';
import type { FC } from 'react';
import Table, { TBody, Td, Th, Thead, Tr } from '@/components/TableVirtual';

const TableVirtualSticky: FC = () => (
  <Table className={{ wrap: 'sb-unstyled' }} maxHeight={200} stickyHeader>
    <Thead>
      <Tr>
        <Th className="w-30" sticky>
          更新场景
        </Th>
        <Th>
          <Tag>Form.Item</Tag> 扩展属性
        </Th>
        <Th>表单组件属性</Th>
      </Tr>
    </Thead>
    <TBody>
      <Tr>
        <Td className="w-30" sticky>
          所属组件
        </Td>
        <Td>
          <Tag>Form.Item</Tag>
        </Td>
        <Td>
          表单组件，例如：<Tag>Input</Tag>
        </Td>
      </Tr>
      <Tr>
        <Td className="w-30" sticky>
          ①自然输入
        </Td>
        <Td>
          不会触发扩展的 <Tag>onChange</Tag> 回调，但会将 <Tag>schema</Tag> 转换成一条{' '}
          <Tag>Rule</Tag>
          ，用于自然输入后校验，更新的数据不一定符合预期
        </Td>
        <Td>
          触发表单组件 <Tag>onChange</Tag>，更新数据后通过 <Tag>rule</Tag>{' '}
          校验，更新的值不一定符合预期
        </Td>
      </Tr>
      <Tr>
        <Td className="w-30" sticky>
          ②通过 <Tag>emit</Tag> 手动更新
        </Td>
        <Td>
          触发扩展的 <Tag>onChange</Tag>，若配置了 <Tag>schema</Tag>{' '}
          将在数据更新前完成校验，更新的数据一定符合预定类型；否则需要配置 <Tag>rule</Tag>{' '}
          在数据更新后进行校验，更新的数据不一定符合预期。建议使用 <Tag>schema</Tag> 代替{' '}
          <Tag>rule</Tag>，否则一起使用会在最终提交表单时，重复校验。
        </Td>
        <Td>不支持手动更新</Td>
      </Tr>
    </TBody>
  </Table>
);

export default TableVirtualSticky;
