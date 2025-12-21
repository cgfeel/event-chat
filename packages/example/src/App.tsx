import './App.css';
import ExtraGuid from './components/ExtraGuid';
import Layout from './components/Layout';
import ChatLayout from './components/chat/ChatLayout';
import Toast from './components/toast';
import PubNoLimit from './module/PubNoLimit';
import PubSchema from './module/PubSchema';
import SubNoLimit from './module/SubNoLimit';
import SubSchema from './module/SubSchema';

const App = () => {
  return (
    <div className="m-auto max-w-400 p-4">
      <Toast />
      <Layout
        list={[
          <ChatLayout
            extra={<ExtraGuid>直接发型消息，无限制</ExtraGuid>}
            footer={110}
            key="pub"
            title="pub-no-limit"
          >
            <PubNoLimit />
          </ChatLayout>,
          <ChatLayout
            extra={<ExtraGuid>直接发送信息，无限制</ExtraGuid>}
            footer={110}
            key="sub"
            title="sub-no-limit"
          >
            <SubNoLimit />
          </ChatLayout>,
        ]}
        title="Event-chat-nolimit"
      />
      <hr className="mb-4 mt-4" />
      <Layout
        list={[
          <ChatLayout
            extra={<ExtraGuid>直接发型消息，无限制</ExtraGuid>}
            footer={110}
            key="pub"
            title="pub-zod-schema"
          >
            <PubSchema />
          </ChatLayout>,
          <ChatLayout
            extra={<ExtraGuid>直接发送信息，无限制</ExtraGuid>}
            footer={110}
            key="sub"
            title="sub-no-limit"
          >
            <SubSchema />
          </ChatLayout>,
        ]}
        title="Event-chat-by-zod-schema"
      />
    </div>
  );
};

export default App;
