import FormEvent from '@event-chat/antd-item';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Input } from 'antd';
import { type FC, useState } from 'react';
import z from 'zod';

const featchMail = (email: string) =>
  new Promise((resolve, reject) => {
    setTimeout(() => {
      const result = /.*\d$/.test(email.split('@')[0]);
      return result ? resolve(email) : reject(new Error('该邮箱已注册，邮箱账号必须数字结尾'));
    }, 2000);
  });

const FormAsync: FC = () => {
  const [loading, setLoading] = useState(false);
  return (
    <div className="max-w-150">
      <FormEvent labelCol={{ span: 8 }} wrapperCol={{ span: 16 }}>
        <FormEvent.Item colon={false} label={` `}>
          只有数字结尾的邮箱才能被注册（失焦验证）
        </FormEvent.Item>
        <FormEvent.Item
          extra="请输入邮箱地址，必须以 event.chat 结尾"
          label="注册邮箱"
          name="email"
          schema={z.email({ error: '请输入有效的邮箱格式' }).pipe(
            z
              .email()
              .refine((email) => email.endsWith('@event.chat'), {
                error: '邮箱地址必须以 @event.chat 结尾',
              })
              .pipe(
                z.email().refine((email) => {
                  setLoading(true);
                  return featchMail(email).finally(() => setLoading(false));
                })
              )
          )}
          validateTrigger="onBlur"
          async
        >
          <Input
            disabled={loading}
            placeholder="请输入邮箱地址，必须以 event.chat 结尾"
            suffix={
              loading ? <FontAwesomeIcon className="animate-spin" icon={faSpinner} /> : <span />
            }
          />
        </FormEvent.Item>
      </FormEvent>
    </div>
  );
};

export default FormAsync;
