import { useEventChat } from '@event-chat/core';
import {
  type FC,
  type PropsWithChildren,
  type ReactNode,
  type RefObject,
  useRef,
  useState,
} from 'react';
import ChatList from '@/components/chat/ChatList';
import type { ChatItemProps } from '@/components/chat/utils';
import { groupName, subGroupItems } from '@/utils/event';
import { safetyPrint } from '@/utils/fields';

const GroupItem: FC<PropsWithChildren<GroupItemProps>> = ({
  children,
  className,
  header,
  rollRef,
}) => (
  <div
    className={['gap-2 grid grid-rows-[60px_1fr] h-78 p-2 rounded-md shadow-md', className]
      .filter(Boolean)
      .join(' ')}
  >
    <div className="bg-slate-700 flex gap-2 items-center p-4 rounded-md">{header}</div>
    <div className="h-full overflow-y-auto p-2" ref={rollRef}>
      {children}
    </div>
  </div>
);

const SubPanel: FC<SubPanelProps> = ({ group, name, ...props }) => {
  const [list, setList] = useState<ChatItemProps[]>([]);
  const rollRef = useRef<HTMLDivElement>(null);

  useEventChat(name, {
    callback: ({ detail, origin }) =>
      setList((current) =>
        current.concat({
          content: safetyPrint(detail),
          header: origin,
          time: new Date(),
          type: 'receive',
        })
      ),
    group,
  });

  return (
    <GroupItem {...props} rollRef={rollRef}>
      <ChatList
        backgroundColor="bg-slate-500 group-[.bg-green-600]:bg-emerald-700"
        list={list}
        rollRef={rollRef}
        textColor="text-slate-500 group-[.bg-green-600]:text-emerald-700"
      />
    </GroupItem>
  );
};

const SubGroup: FC = () => (
  <div className="gap-4 grid grid-cols-1">
    <SubPanel
      className="bg-slate-800 group"
      group={groupName}
      header={[
        <span key="name">sub-group-items</span>,
        <span className="bg-slate-400 flex h-full items-center px-1 rounded-md text-sm" key="desc">
          group
        </span>,
      ]}
      name={subGroupItems}
    />
    <SubPanel
      className="bg-green-600 group"
      header={[
        <span key="name">sub-group-items</span>,
        <span className="bg-green-600 flex h-full items-center px-1 rounded-md text-sm" key="desc">
          global
        </span>,
      ]}
      name={subGroupItems}
    />
  </div>
);

export default SubGroup;

interface GroupItemProps extends Pick<SubPanelProps, 'className' | 'header'> {
  rollRef?: RefObject<HTMLDivElement>;
}

interface SubPanelProps {
  header: ReactNode;
  name: string;
  className?: string;
  group?: string;
}
