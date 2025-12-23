import './App.css';
import ExtraGuid from './components/ExtraGuid';
import Layout from './components/Layout';
import ChatLayout from './components/chat/ChatLayout';
import Toast from './components/toast';
import PubGroup from './module/PubGroup';
import PubNoLimit from './module/PubNoLimit';
import PubSchema from './module/PubSchema';
import PubSchemaExtra from './module/PubSchemaExtra';
import SubNoLimit from './module/SubNoLimit';
import SubSchema from './module/SubSchema';
import SubSchemaExtra from './module/SubSchemaExtra';
import SubGroup from './module/subGroup';

const App = () => {
  return (
    <div className="m-auto max-w-400 p-4">
      <Toast />
      <Layout
        list={[
          <ChatLayout
            extra={<ExtraGuid>直接发型消息，无限制</ExtraGuid>}
            key="pub"
            title="pub-no-limit"
          >
            <PubNoLimit />
          </ChatLayout>,
          <ChatLayout
            extra={<ExtraGuid>直接发送信息，无限制</ExtraGuid>}
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
            extra={<ExtraGuid>直接发型消息，无限制</ExtraGuid>}
            key="pub"
            title="pub-group-items"
          >
            <PubGroup />
          </ChatLayout>,
          <ChatLayout key="sub" title="sub-group-items">
            <SubGroup />
          </ChatLayout>,
        ]}
        title="Event-chat-group"
      />
    </div>
  );
};

export default App;
