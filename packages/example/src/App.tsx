import { type FC, Suspense, lazy, useState } from 'react';
import './App.css';
import Tabs, { TabItem } from './components/Tabs';
import { isKey } from './utils/fields';

const AntdForm = lazy(() => import('./pages/AntdForm'));
const EventChat = lazy(() => import('./pages/EventChat'));
const NotFound = lazy(() => import('./pages/NotFound'));

const Router = Object.freeze({ AntdForm, EventChat });

const App: FC = () => {
  const [current, setCurrent] = useState('EventChat');
  const IndexCom = isKey(current, Router) ? Router[current] : NotFound;

  return (
    <>
      <div className="flex justify-center items-center py-4 w-full">
        <Tabs defaultActive="EventChat" onChange={(detail) => setCurrent(String(detail))}>
          <TabItem name="EventChat">eventChat</TabItem>
          <TabItem name="AntdForm">antdForm</TabItem>
          <TabItem name="antd-form1">antdForm1</TabItem>
          <TabItem name="antd-form2">antdForm2</TabItem>
        </Tabs>
      </div>
      <Suspense
        fallback={<div className="flex justify-center items-center w-full">loading...</div>}
      >
        <div className="m-auto max-w-400 p-4">
          <IndexCom />
        </div>
      </Suspense>
    </>
  );
};

export default App;
