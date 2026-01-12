import { useEventChat } from '@event-chat/core';
import { type FC, type PropsWithChildren, type ReactNode, useState } from 'react';
import Switch from '@/components/Switch';
import ChatPanel from '@/components/chat/ChatPanel';
import { groupName, subGroupItems } from '@/utils/event';

const GroupItem: FC<PropsWithChildren<{ title: ReactNode }>> = ({ children, title }) => (
  <div className="flex gap-2 items-center">
    <span className="text-xs">{title}</span>
    {children}
  </div>
);

const PubPanel: FC<PubPanelProps> = ({ disabled, group, name }) => {
  const [checked, setChecked] = useState(false);
  const { emit } = useEventChat(name, {
    group,
  });

  return (
    <ChatPanel
      wraper="h-36"
      onChange={(detail) => emit({ global: checked, name: subGroupItems, detail })}
    >
      <div className="flex items-center justify-between w-full">
        <div>{name}</div>
        <GroupItem title="发送到公屏">
          <Switch
            checked={checked}
            disabled={disabled}
            onChange={({ target }) => setChecked(target.checked)}
          />
        </GroupItem>
      </div>
    </ChatPanel>
  );
};

const PubGroupPanel: FC = () => (
  <div className="gap-4 grid grid-cols-1">
    <PubPanel group={groupName} name="pub-group-item-1" />
    <PubPanel group={groupName} name="pub-group-item-2" />
    <PubPanel name="pub-global-item" disabled />
  </div>
);

export default PubGroupPanel;

interface PubPanelProps {
  name: string;
  disabled?: boolean;
  group?: string;
}
