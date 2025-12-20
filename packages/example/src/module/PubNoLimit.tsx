import { useEventChat } from '@event-chat/core';
import { type FC, useRef, useState } from 'react';
import { type ChatItemProps } from '../components/ChatItem';
import ChatList from '../components/ChatList';
import ChatPanel from '../components/ChatPanel';
import { safetyPrint } from '../utils';

const PubNoLimit: FC = () => {
  const [list, setList] = useState<ChatItemProps[]>([]);
  const rollRef = useRef<HTMLDivElement>(null);

  //   const { emit } = useEventChat('pub-no-limit');

  const { emit } = useEventChat('pub-no-limit', {
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
        emit({ name: 'sub-no-limit', detail });
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

export default PubNoLimit;
