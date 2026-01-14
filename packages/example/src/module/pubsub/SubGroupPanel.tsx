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
    className={['grid h-78 grid-rows-[60px_1fr] gap-2 rounded-md p-2 shadow-md', className]
      .filter(Boolean)
      .join(' ')}
  >
    <div className="flex items-center gap-2 rounded-md bg-slate-700 p-4">{header}</div>
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
  <div className="grid grid-cols-1 gap-4">
    <SubPanel
      className="group bg-slate-800"
      group={groupName}
      header={[
        <span key="name">sub-group-items</span>,
        <span className="flex h-full items-center rounded-md bg-slate-400 px-1 text-sm" key="desc">
          group
        </span>,
      ]}
      name={subGroupItems}
    />
    <SubPanel
      className="group bg-green-600"
      header={[
        <span key="name">sub-group-items</span>,
        <span className="flex h-full items-center rounded-md bg-green-600 px-1 text-sm" key="desc">
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
