import { FormEvent } from '@event-chat/antd-item';
import { ConfigProvider, Form, theme } from 'antd';
import { type FC, Suspense, lazy, useState } from 'react';
import './App.css';
import Tabs, { TabItem } from './components/Tabs';
import Toast from './components/toast';
import { isKey } from './utils/fields';

const AntdForm = lazy(() => import('./pages/AntdForm'));
const EventChat = lazy(() => import('./pages/EventChat'));
const NotFound = lazy(() => import('./pages/NotFound'));

const Router = Object.freeze({ AntdForm, EventChat });
FormEvent.observer(Form);

const App: FC = () => {
  const [current, setCurrent] = useState('EventChat');
  const IndexCom = isKey(current, Router) ? Router[current] : NotFound;

  return (
    <>
      <Toast />
      <div className="flex justify-center items-center py-4 w-full">
        <Tabs defaultActive="EventChat" onChange={(detail) => setCurrent(String(detail))}>
          <TabItem name="EventChat">eventChat</TabItem>
          <TabItem name="AntdForm">antdForm</TabItem>
          <TabItem name="antd-form1">antdForm1</TabItem>
        </Tabs>
      </div>
      <ConfigProvider
        theme={{
          algorithm: theme.darkAlgorithm,
        }}
      >
        <Suspense
          fallback={
            <div className="animate-fade-in-up flex justify-center items-center w-full">
              loading...
            </div>
          }
        >
          <div className="animate-fade-in-up m-auto max-w-400 p-4">
            <IndexCom />
          </div>
        </Suspense>
      </ConfigProvider>
    </>
  );
};

export default App;
