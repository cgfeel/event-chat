import FormEvent from '@event-chat/antd-item';
import { Input, Rate, Space, Typography } from 'antd';
import type { FC } from 'react';

const { Text } = Typography;

const FormAppend: FC = () => {
  // const [form] = FormEvent.useForm()
  return (
    <div className="max-w-150">
      <FormEvent labelCol={{ span: 8 }} wrapperCol={{ span: 16 }}>
        <FormEvent.Item
          label="主控表单"
          name="origin.input"
          onChange={(detail, { emit }) => emit({ name: 'target', detail })}
        >
          <Input />
        </FormEvent.Item>
        <FormEvent.Item label="受控字段" name="target">
          <Input />
        </FormEvent.Item>
        <FormEvent.Item label="受控节点">
          <Space>
            <FormEvent.Item name="target.field" noStyle>
              <Rate disabled />
            </FormEvent.Item>
            <Text type="secondary">只能受控字段转发更新</Text>
          </Space>
        </FormEvent.Item>
      </FormEvent>
    </div>
  );
};

export default FormAppend;
