import type { FC, PropsWithChildren, ReactNode } from 'react';
import Switch from '@/components/Switch';
import ChatPanel from '@/components/chat/ChatPanel';

const GroupItem: FC<PropsWithChildren<{ title: ReactNode }>> = ({ children, title }) => (
  <div className="flex gap-2 items-center">
    <span className="text-xs">{title}</span>
    {children}
  </div>
);

const PubGroup: FC = () => (
  <div className="gap-4 grid grid-cols-1">
    <ChatPanel wraper="h-36">
      <div className="flex items-center justify-between w-full">
        <div>pub-group-item-1</div>
        <GroupItem title="发送到公屏">
          <Switch />
        </GroupItem>
      </div>
    </ChatPanel>
    <ChatPanel wraper="h-36">
      <div className="flex items-center justify-between w-full">
        <div>pub-group-item-2</div>
        <GroupItem title="发送到公屏">
          <Switch />
        </GroupItem>
      </div>
    </ChatPanel>
    <ChatPanel wraper="h-36">
      <div className="flex items-center justify-between w-full">
        <div>pub-global-item</div>
        <GroupItem title="发送到公屏">
          <Switch disabled />
        </GroupItem>
      </div>
    </ChatPanel>
  </div>
);

export default PubGroup;
