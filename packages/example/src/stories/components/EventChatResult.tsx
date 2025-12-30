import type { EventDetailType } from '@event-chat/core';
import type { FC } from 'react';
import BasicPrint from './BasicPrint';

const EventChatResult: FC<EventChatResultProps> = (props) => <BasicPrint {...props} />;

export default EventChatResult;

export interface EventChatResultProps {
  /**
   * 返回的密钥，用于私聊时发送方通过 `emiit` 携带发送
   */
  token: string;
  /**
   * 发送事件消息的方法
   */
  emit: <Detail, CustomName extends string>(
    detail: Omit<EventDetailType<Detail, CustomName>, '__origin' | 'group' | 'id' | 'type'>
  ) => void;
}
