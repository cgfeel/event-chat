import { createToken, useEventChat } from '@event-chat/core';
import _merge from 'lodash/merge';
import { type FC, useEffect, useRef, useState } from 'react';
import {
  pubZodAllow,
  pubZodSchema,
  subZodSchema,
  subZodSchemaResult,
  toastOpen,
} from '@/utils/event';
import ChatList from '../../components/chat/ChatList';
import ChatPanel from '../../components/chat/ChatPanel';
import { safetyPrint } from '../../utils/fields';
import { type ChatItemType, checkStatus, pubSchema, subSchema } from '../utils';
import RenderSchema from './RenderSchema';

const PubSchema: FC = () => {
  const [list, setList] = useState<ChatItemType[]>([]);
  const rollRef = useRef<HTMLDivElement>(null);

  const { emit } = useEventChat(pubZodSchema, {
    schema: pubSchema,
    callback: ({ detail, origin }) => {
      setList((current) =>
        current.concat({
          content: detail,
          time: new Date(),
          type: 'receive',
        })
      );
      emit({
        detail: {
          message: '这条 toast 也是 event-chat 示例',
          title: `成功收到来自 ${origin} 的消息`,
          type: 'success',
        },
        name: toastOpen,
      });
      if (detail.id) {
        emit({ detail: { id: detail.id, type: 'send' }, name: subZodSchemaResult });
      }
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
        emit({ detail: { id: safetyPrint(id), type: 'faild' }, name: subZodSchemaResult });
      }
    },
  });

  useEffect(() => {
    const current = list.slice(-1)[0]?.content.status;
    if (current) {
      emit({
        name: pubZodAllow,
        detail: current === 'waiting' ? ['error', 'faild', 'success', 'waiting'] : [current],
      });
    }
  }, [list, emit]);

  return (
    <ChatPanel
      rollRef={rollRef}
      onChange={(record) => {
        const id = createToken('pub-schema');
        const [status, message = ''] = record
          .split(':')
          .map((val) => val.trim())
          .filter(Boolean);

        const detail = { id, message, status };
        const schema = subSchema.refine(
          (current) =>
            checkStatus(
              current,
              list.filter((item) => item.type === 'receive')
            ),
          {
            error: '状态不正确',
          }
        );

        const result = schema.safeParse(detail);
        const uplist =
          !result.success || result.data.status === 'waiting'
            ? list
            : list.map((item) =>
                item.type !== 'receive' || item.content.status !== 'waiting'
                  ? item
                  : _merge({}, item, { content: { status: result.data.status } })
              );

        emit({ name: subZodSchema, detail });
        setList(
          uplist.concat({
            content: result.success
              ? result.data
              : {
                  message: result.error.issues[0].message,
                  status: 'error',
                },
            time: new Date(),
            type: result.success ? 'send' : 'faild',
          })
        );
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
  );
};

export default PubSchema;
