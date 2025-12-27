import PubNoLimit from '@/module/PubNoLimit';
import SubNoLimit from '@/module/SubNoLimit';
import type { FC } from 'react';
import ExtraGuid from '@/components/ExtraGuid';
import Layout from '@/components/Layout';
import ChatLayout from '@/components/chat/ChatLayout';

const NormalChat: FC = () => {
  return (
    <div className="m-auto max-w-400 p-4">
      <Layout
        list={[
          <ChatLayout
            extra={<ExtraGuid>无限制收发型消息</ExtraGuid>}
            key="pub"
            title="pub-no-limit"
          >
            <PubNoLimit />
          </ChatLayout>,
          <ChatLayout
            extra={<ExtraGuid>无限制收发型消息</ExtraGuid>}
            key="sub"
            title="sub-no-limit"
          >
            <SubNoLimit />
          </ChatLayout>,
        ]}
        title="Event-chat-nolimit"
      />
    </div>
  );
};

export default NormalChat;
