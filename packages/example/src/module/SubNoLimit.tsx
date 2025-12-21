import { useEventChat } from '@event-chat/core';
import { type FC, useRef, useState } from 'react';
import { pubNoLimit, subNoLimit } from '@/utils/event';
import { type ChatItemProps } from '../components/chat/ChatItem';
import ChatList from '../components/chat/ChatList';
import ChatPanel from '../components/chat/ChatPanel';
import { safetyPrint } from '../utils';

const SubNoLimit: FC = () => {
  const [list, setList] = useState<ChatItemProps[]>([]);
  const rollRef = useRef<HTMLDivElement>(null);

  const { emit } = useEventChat(subNoLimit, {
    callback: (record) =>
      setList((current) =>
        current.concat({
          content: safetyPrint(record.detail),
          receive: true,
          time: new Date(),
        })
      ),
  });
  return (
    <ChatPanel
      rollRef={rollRef}
      onChange={(detail) => {
        emit({ name: pubNoLimit, detail });
        setList((current) =>
          current.concat({
            content: detail,
            time: new Date(),
          })
        );
      }}
    >
      <ChatList list={list} rollRef={rollRef} />
    </ChatPanel>
  );
};

export default SubNoLimit;
