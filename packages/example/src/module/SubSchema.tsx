import { useEventChat } from '@event-chat/core';
import { type FC, useRef, useState } from 'react';
import { pubZodSchema, subZodSchema } from '@/utils/event';
import { type ChatItemProps } from '../components/chat/ChatItem';
import ChatList from '../components/chat/ChatList';
import ChatPanel from '../components/chat/ChatPanel';
import { safetyPrint } from '../utils';

const SubSchema: FC = () => {
  const [list, setList] = useState<ChatItemProps[]>([]);
  const rollRef = useRef<HTMLDivElement>(null);

  const { emit } = useEventChat(subZodSchema, {
    callback: (record) =>
      setList((current) =>
        current.concat({
          content: safetyPrint(record.detail),
          time: new Date(),
          type: 'receive',
        })
      ),
  });
  return (
    <ChatPanel
      rollRef={rollRef}
      onChange={(detail) => {
        emit({ name: pubZodSchema, detail });
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

export default SubSchema;
