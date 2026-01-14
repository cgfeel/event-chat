import {
  PubGroupPanel,
  PubNoLimit,
  PubPrivate,
  PubSchema,
  PubSchemaExtra,
  SubGroupPanel as SubGroup,
  SubNoLimit,
  SubPrivate,
  SubSchema,
  SubSchemaExtra,
} from '@/module/pubsub';
import type { NamepathType } from '@event-chat/core';
import type { FC } from 'react';
import ExtraGuid from '@/components/ExtraGuid';
import Layout from '@/components/Layout';
import ChatLayout from '@/components/chat/ChatLayout';
import { isKey } from '@/utils/fields';

const GroupChat: FC = () => (
  <Layout
    list={[
      <ChatLayout
        extra={
          <ExtraGuid>
            <div className="pt-4 pb-1">
              群组成员发送的信息只能在群组内接收，非群组成员无法接收。
            </div>
            <div className="pt-4 pb-1">群组成员可以通过 global 向公屏发送消息</div>
            <div className="pt-4 pb-1">
              非群组内的成员只能通过 group 设为组内成员才能在群组内发送消息。
            </div>
          </ExtraGuid>
        }
        key="pub"
        title="pub-group-items"
      >
        <PubGroupPanel />
      </ChatLayout>,
      <ChatLayout key="sub" title="sub-group-items">
        <SubGroup />
      </ChatLayout>,
    ]}
    title="Event-chat-group"
  />
);

const NormalChat: FC = () => (
  <Layout
    list={[
      <ChatLayout extra={<ExtraGuid>无限制收发型消息</ExtraGuid>} key="pub" title="pub-no-limit">
        <PubNoLimit />
      </ChatLayout>,
      <ChatLayout extra={<ExtraGuid>无限制收发型消息</ExtraGuid>} key="sub" title="sub-no-limit">
        <SubNoLimit />
      </ChatLayout>,
    ]}
    title="Event-chat-nolimit"
  />
);

const SchemaChat: FC = () => (
  <Layout
    list={[
      <ChatLayout extra={<PubSchemaExtra />} key="pub" title="pub-zod-schema">
        <PubSchema />
      </ChatLayout>,
      <ChatLayout extra={<SubSchemaExtra />} key="sub" title="sub-zod-schema">
        <SubSchema />
      </ChatLayout>,
    ]}
    title="Event-chat-by-zod-schema"
  />
);

const TokenChat: FC = () => (
  <Layout
    list={[
      <ChatLayout extra={<ExtraGuid>无限制收发型消息</ExtraGuid>} key="pub" title="pub-private">
        <PubPrivate />
      </ChatLayout>,
      <ChatLayout
        extra={<ExtraGuid>接消息无限制，发送消息需先同步 pub-private 的 token</ExtraGuid>}
        key="sub"
        title="sub-no-private"
      >
        <SubPrivate />
      </ChatLayout>,
    ]}
    title="Event-chat-private"
  />
);

const demoMap = Object.freeze({
  GroupChat,
  NormalChat,
  SchemaChat,
  TokenChat,
});

const EventChat: FC<EventChatProps> = ({ name }) => {
  const Demo = isKey(name, demoMap) ? demoMap[name] : null;
  return Demo ? <Demo /> : null;
};

export default EventChat;

export interface EventChatProps {
  /* 演示类型 */
  name: NamepathType;
}
