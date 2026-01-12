import FormEvent from '@event-chat/antd-item';
import { Divider, Form, Tag } from 'antd';
import type { FC } from 'react';
import { FormOrigin, FormWrapper } from './FormModule';
import { fieldInput, fieldRate } from './utils';

const FormEmit: FC = () => {
  const [formEvent] = FormEvent.useForm({ group: 'form-emit' });
  const [formRaw] = Form.useForm();
  return (
    <>
      <FormWrapper
        form={formEvent}
        title={
          <>
            <Tag>emit</Tag> 触发更新会被 <Tag>dependencies</Tag> 监听
          </>
        }
      >
        <FormOrigin
          onChange={({ target }) => formEvent.emit({ detail: target.value, name: fieldInput })}
        />
      </FormWrapper>
      <Divider />
      <FormWrapper
        form={formRaw}
        title={
          <>
            <Tag>setFieldValue</Tag> 触发更新不会被 <Tag>dependencies</Tag> 监听
          </>
        }
      >
        <FormOrigin
          onChange={({ target }) => {
            // 同时会更新 rate 值
            formRaw.setFieldValue(fieldInput, target.value);
            formRaw.setFieldValue(fieldRate, String(Math.random()));
          }}
        />
      </FormWrapper>
    </>
  );
};

export default FormEmit;
