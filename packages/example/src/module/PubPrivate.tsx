import { createToken, useEventChat } from '@event-chat/core';
import { type FC, useRef, useState } from 'react';
import z from 'zod';
import { pubPrivate, subPrivate, subPrivateResult, syncToken, toastOpen } from '@/utils/event';
import { safetyPrint } from '@/utils/fields';
import ChatList from '../components/chat/ChatList';
import ChatPanel from '../components/chat/ChatPanel';
import RenderSchema from './RenderSchema';
import type { ChatItemType } from './utils';

const PubPrivate: FC = () => {
  const [list, setList] = useState<ChatRecordType[]>([]);
  const rollRef = useRef<HTMLDivElement>(null);

  const { token, emit } = useEventChat(pubPrivate, {
    schema: z.object(
      {
        id: z.string({
          error: (issue) => (issue.input === undefined ? '未提供信息编号' : '提供的信息编号不正确'),
        }),
        message: z
          .string({
            error: (issue) => (issue.input === undefined ? '未提供消息' : '提供的消息类型不正确'),
          })
          .min(5, {
            error: '提供的消息最少 5 个字符',
          }),
      },
      {
        error: '提供的数据类型不正确',
      }
    ),
    token: true,
    callback: ({ __origin, detail }) => {
      const uplist = list.concat({
        content: {
          ...detail,
          status: 'success',
        },
        time: new Date(),
        type: 'receive',
      });
      setList(uplist);
      emit({ detail: { id: detail.id, type: 'send' }, name: subPrivateResult });
      emit({
        detail: {
          message: '这条 toast 也是 event-chat 示例',
          title: `成功收到来自 ${__origin} 的消息`,
          type: 'success',
        },
        name: toastOpen,
      });
    },
    debug: (result) => {
      const { issues = [] } = result?.error ?? {};
      const { data } = result ?? {};
      const id: unknown = typeof data === 'object' && data ? Reflect.get(data, 'id') : undefined;

      if (issues.length > 0) {
        emit({
          detail: {
            message: '这条 toast 也是 event-chat 示例',
            title: issues[0].message,
            type: 'error',
          },
          name: toastOpen,
        });
      }

      if (id) {
        emit({ detail: { id: safetyPrint(id), type: 'faild' }, name: subPrivateResult });
      }
    },
  });

  return (
    <>
      <div className="border border-dashed break-all h-13 mb-2 text-xs wrap-break-word p-2">
        Token: {token}{' '}
        <button
          className="bg-amber-700 cursor-pointer rounded-xs px-2"
          type="button"
          onClick={() => emit({ detail: token, name: syncToken })}
        >
          sync
        </button>
      </div>
      <ChatPanel
        rollRef={rollRef}
        onChange={(detail) => {
          const content = Object.freeze({
            id: createToken('pub-private'),
            message: detail,
            status: 'success',
          });
          const uplist = list.concat({
            time: new Date(),
            type: 'send',
            content,
          });
          emit({ name: subPrivate, detail: content });
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

export default PubPrivate;

type ChatRecordType = Omit<ChatItemType, 'content'> & {
  content: ChatItemType['content'] & { message: string };
};
