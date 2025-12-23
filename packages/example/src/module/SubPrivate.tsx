import { createToken, useEventChat } from '@event-chat/core';
import { faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { type FC, useRef, useState } from 'react';
import z from 'zod';
import { chatMap } from '@/components/chat/utils';
import { pubPrivate, subPrivate, subPrivateResult, syncToken } from '@/utils/event';
import { objectKeys, safetyPrint } from '@/utils/fields';
import ChatList from '../components/chat/ChatList';
import ChatPanel from '../components/chat/ChatPanel';
import RenderSchema from './RenderSchema';
import type { ChatItemType } from './utils';

const SubPrivate: FC = () => {
  const [list, setList] = useState<ChatRecordType[]>([]);
  const [token, setToken] = useState('');
  const rollRef = useRef<HTMLDivElement>(null);

  const { emit } = useEventChat(subPrivate, {
    schema: z.object({
      id: z.string(),
      message: z.string(),
    }),
    callback: ({ detail }) => {
      const uplist = list.concat({
        content: {
          ...detail,
          status: 'success',
        },
        time: new Date(),
        type: 'receive',
      });
      setList(uplist);
    },
  });

  useEventChat(subPrivateResult, {
    schema: z.object({
      id: z.string(),
      type: z.enum(objectKeys(chatMap)),
    }),
    callback: (record) => {
      const { id, type } = record.detail;
      const index = list.findIndex(({ content }) => content.id === id);
      const result = [...list];
      if (index > -1) {
        result.splice(index, 1, { ...result[index], type });
        setList(result);
      }
    },
  });

  useEventChat(syncToken, {
    callback: ({ detail }) => setToken(safetyPrint(detail)),
  });

  return (
    <>
      <div className="border border-dashed break-all h-13 mb-2 text-xs wrap-break-word p-2">
        Sync: {token || '--'}{' '}
        {token && (
          <FontAwesomeIcon
            className="cursor-pointer"
            icon={faTimesCircle}
            onClick={() => setToken('')}
          />
        )}
      </div>
      <ChatPanel
        rollRef={rollRef}
        onChange={(detail) => {
          const content = Object.freeze({
            id: createToken('sub-private'),
            message: detail,
            status: 'waiting',
          });
          const uplist = list.concat({
            time: new Date(),
            type: 'send',
            content,
          });
          emit({ detail: content, name: pubPrivate, token: token || undefined });
          setList(uplist);
        }}
      >
        <ChatList
          list={list.map(({ content, ...item }) => ({
            ...item,
            content: <RenderSchema item={content} />,
          }))}
          rollRef={rollRef}
        />
      </ChatPanel>
    </>
  );
};

export default SubPrivate;

type ChatRecordType = Omit<ChatItemType, 'content'> & {
  content: ChatItemType['content'] & { message: string };
};
