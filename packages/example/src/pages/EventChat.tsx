import type { FC } from 'react';
import ExtraGuid from '../components/ExtraGuid';
import Layout from '../components/Layout';
import ChatLayout from '../components/chat/ChatLayout';
import Toast from '../components/toast';
import PubGroupPanel from '../module/PubGroupPanel';
import PubNoLimit from '../module/PubNoLimit';
import PubPrivate from '../module/PubPrivate';
import PubSchema from '../module/PubSchema';
import PubSchemaExtra from '../module/PubSchemaExtra';
import SubGroup from '../module/SubGroupPanel';
import SubNoLimit from '../module/SubNoLimit';
import SubPrivate from '../module/SubPrivate';
import SubSchema from '../module/SubSchema';
import SubSchemaExtra from '../module/SubSchemaExtra';

const EventChat: FC = () => (
  <>
    <Toast />
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
    <hr className="mb-4 mt-4" />
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
    <hr className="mb-4 mt-4" />
    <Layout
      list={[
        <ChatLayout
          extra={
            <ExtraGuid>
              <div className="pb-1 pt-4">
                群组成员发送的信息只能在群组内接收，非群组成员无法接收。
              </div>
              <div className="pb-1 pt-4">群组成员可以通过 global 向公屏发送消息</div>
              <div className="pb-1 pt-4">
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
    <hr className="mb-4 mt-4" />
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
    <hr className="mb-4 mt-4" />
  </>
);

export default EventChat;
