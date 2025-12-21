import { type FC, type RefObject, useEffect } from 'react';
import { createKey } from '../../utils';
import ChatItem, { type ChatItemProps } from './ChatItem';

const ChatList: FC<ChatListProps> = ({ list, rollRef }) => {
  useEffect(() => {
    Promise.resolve()
      .then(() => {
        if (rollRef?.current)
          rollRef.current.scrollTo({
            top: rollRef.current.scrollHeight - rollRef.current.clientHeight,
            behavior: 'smooth',
          });
      })
      .catch(() => {});
  }, [list, rollRef]);

  return (
    <>
      {list.map((item, idx) => (
        <ChatItem {...item} key={createKey(idx)} />
      ))}
      <div className="flex items-center justify-center w-full my-6">
        <div className="flex-1 h-px bg-slate-500" />
        <div className="px-4 text-sm text-slate-500">
          {list.length > 0 ? '到底了' : '请输入内容'}
        </div>
        <div className="flex-1 h-px bg-slate-500" />
      </div>
    </>
  );
};

export default ChatList;

interface ChatListProps {
  list: ChatItemProps[];
  rollRef?: RefObject<HTMLDivElement>;
}
