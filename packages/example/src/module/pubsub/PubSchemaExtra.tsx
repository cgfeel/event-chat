import { useEventChat } from '@event-chat/core';
import { type FC, useState } from 'react';
import z from 'zod';
import ExtraGuid from '@/components/ExtraGuid';
import { pubZodAllow } from '@/utils/event';
import { type ChatItemType, statusEnum } from '../utils';

const PubSchemaExtra: FC = () => {
  const [status, setState] = useState<Array<ChatItemType['content']['status']>>(['waiting']);
  useEventChat(pubZodAllow, {
    schema: z.array(statusEnum),
    callback: ({ detail }) => setState(detail),
  });
  return (
    <ExtraGuid title="只接受以下类型的字符：">
      <pre>{`[${status.join('|')}]: string`}</pre>
      <div className="pt-4 pb-1">例如：</div>
      <pre>{'waiting: 正在执行操作'}</pre>
      <div className="pt-4 pb-1">也可以传一个错误的数据试试，注意：状态根据回复动态改变的</div>
      <div className="pt-4 pb-1">因为 useEeventChat 会自动为你收集参数的更新</div>
    </ExtraGuid>
  );
};

export default PubSchemaExtra;
