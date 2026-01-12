import { useEventChat } from '@event-chat/core';
import { type FC, useRef, useState } from 'react';
import { pubNoLimit, subNoLimit } from '@/utils/event';
import ChatList from '../../components/chat/ChatList';
import ChatPanel from '../../components/chat/ChatPanel';
import { type ChatItemProps } from '../../components/chat/utils';
import { safetyPrint } from '../../utils/fields';

const SubNoLimit: FC = () => {
  const [list, setList] = useState<ChatItemProps[]>([]);
  const rollRef = useRef<HTMLDivElement>(null);

  const { emit } = useEventChat(subNoLimit, {
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
        emit({ name: pubNoLimit, detail });
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

export default SubNoLimit;
