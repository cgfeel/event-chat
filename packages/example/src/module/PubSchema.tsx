import { useEventChat } from '@event-chat/core';
import { type FC, useRef, useState } from 'react';
import { z } from 'zod';
import { pubZodSchema, subNoLimit, toastOpen } from '@/utils/event';
import { type ChatItemProps } from '../components/chat/ChatItem';
import ChatList from '../components/chat/ChatList';
import ChatPanel from '../components/chat/ChatPanel';
import { safetyPrint } from '../utils';

const PubSchema: FC = () => {
  const [list, setList] = useState<ChatItemProps[]>([]);
  const rollRef = useRef<HTMLDivElement>(null);

  const { emit } = useEventChat(pubZodSchema, {
    schema: z.object(
      {
        title: z.string().describe('testst'),
        ingredients: z.array(z.string()),
        description: z.string().optional(),
        id: z.string().optional(),
      },
      {
        error: '提交的格式和要求的不匹配',
      }
    ),
    callback: (record) =>
      setList((current) =>
        current.concat({
          content: safetyPrint(record.detail),
          time: new Date(),
          type: 'receive',
        })
      ),
    debug: (result) => {
      const { errors = [] } = result?.error ? z.treeifyError(result.error) : {};
      if (errors.length > 0) {
        emit({
          detail: { message: '这条 toast 也是 event-chat 示例', title: errors[0], type: 'error' },
          name: toastOpen,
        });
      }
    },
  });

  return (
    <ChatPanel
      rollRef={rollRef}
      onChange={(detail) => {
        emit({ name: subNoLimit, detail });
        setList((current) =>
          current.concat({
            content: detail,
            time: new Date(),
            type: 'send',
          })
        );
      }}
    >
      <ChatList list={list} rollRef={rollRef} />
    </ChatPanel>
  );
};

export default PubSchema;
