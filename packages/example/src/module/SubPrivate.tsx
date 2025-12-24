import { createToken, useEventChat } from '@event-chat/core';
import { faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import _merge from 'lodash/merge';
import { type FC, useRef, useState } from 'react';
import z from 'zod';
import { chatMap } from '@/components/chat/utils';
import { pubPrivate, subPrivate, subPrivateResult, syncToken } from '@/utils/event';
import { isKey, objectKeys, safetyPrint } from '@/utils/fields';
import ChatList from '../components/chat/ChatList';
import ChatPanel from '../components/chat/ChatPanel';
import RenderSchema from './RenderSchema';
import type { ChatItemType } from './utils';

const statusMap = Object.freeze({
  faild: 'error',
  send: 'success',
});

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
        const detail = _merge({}, result[index], {
          content: {
            status: isKey(type, statusMap) ? statusMap[type] : type,
          },
          type,
        });

        result.splice(index, 1, detail);
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
          const uplist = list.concat({
            time: new Date(),
            type: 'send',
            content: {
              id: createToken('sub-private'),
              message: detail,
              status: 'waiting',
            },
          });
          emit({
            detail: uplist.slice(-1)[0].content,
            name: pubPrivate,
            token: token || undefined,
          });
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
