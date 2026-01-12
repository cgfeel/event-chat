import { createToken, useEventChat } from '@event-chat/core';
import _merge from 'lodash/merge';
import { type FC, useRef, useState } from 'react';
import z from 'zod';
import { pubZodSchema, subZodSchema, subZodSchemaResult, toastOpen } from '@/utils/event';
import ChatList from '../../components/chat/ChatList';
import ChatPanel from '../../components/chat/ChatPanel';
import { chatMap } from '../../components/chat/utils';
import { objectKeys, safetyParse } from '../../utils/fields';
import { type ChatItemType, checkStatus, pubSchema, subSchema } from '../utils';
import RenderSchema from './RenderSchema';

const parseSchema = (data: Record<string, unknown>): data is z.infer<typeof pubSchema> =>
  data !== undefined && pubSchema.safeParse(data).success;

const SubSchema: FC = () => {
  const [list, setList] = useState<ChatItemType[]>([]);
  const rollRef = useRef<HTMLDivElement>(null);

  const { emit } = useEventChat(subZodSchema, {
    schema: subSchema.refine(
      (detail) =>
        checkStatus(
          detail,
          list.filter((item) => item.type === 'send')
        ),
      {
        error: '状态不正确',
      }
    ),
    callback: ({ detail, origin }) => {
      const updateList =
        detail.status === 'waiting'
          ? list
          : list.map((item) =>
              item.type !== 'send' || item.content.status !== 'waiting'
                ? item
                : _merge({}, item, { content: { status: detail.status } })
            );

      setList(
        updateList.concat({
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
    },
    debug: (result) => {
      const { issues = [] } = result?.error ?? {};
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
    },
  });

  useEventChat(subZodSchemaResult, {
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

  return (
    <ChatPanel
      rollRef={rollRef}
      onChange={(detail) => {
        const id = createToken('sub-schema');
        const data = safetyParse(detail);
        const mode = { ...(data ?? { data: detail }), status: 'waiting', id };

        emit({
          detail: mode,
          name: pubZodSchema,
        });

        setList((current) =>
          current.concat({
            content: parseSchema(mode)
              ? mode
              : {
                  message: detail,
                  status: 'error',
                  id,
                },
            time: new Date(),
            type: 'waiting',
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

export default SubSchema;
