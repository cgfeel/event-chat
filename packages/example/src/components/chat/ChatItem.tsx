import type { FC, ReactNode } from 'react';

const getTime = (datetime: Date) => datetime.toLocaleString().split(' ').pop();

const Receive: FC<Omit<ChatItemProps, 'receive'>> = ({ content, time }) => (
  <div className="mb-4 flex justify-start">
    <div className="relative max-w-[80%] bg-white px-4 py-3 rounded-lg rounded-tl-none shadow-sm">
      <p className="text-slate-800 wrap-break-word break-all">{content}</p>
      <p className="text-xs text-slate-400 mt-1 text-right">{getTime(time)}</p>
      <div className="absolute -left-1 top-2 w-0 h-0 border-y-4 border-y-transparent border-r-4 border-r-white" />
    </div>
  </div>
);

const Send: FC<Omit<ChatItemProps, 'receive'>> = ({ content, time }) => (
  <div className="mb-4 flex justify-end">
    <div className="relative max-w-[80%] bg-blue-600 px-4 py-3 rounded-lg rounded-tr-none shadow-sm">
      <p className="text-white wrap-break-word break-all">{content}</p>
      <p className="text-xs text-slate-400 mt-1 text-right">{getTime(time)}</p>
      <div className="absolute -right-1 top-2 w-0 h-0 border-y-4 border-y-transparent border-l-4 border-l-blue-600" />
    </div>
  </div>
);

const ChatItem: FC<ChatItemProps> = ({ receive, ...props }) => {
  const TimeCom = receive ? Receive : Send;
  return <TimeCom {...props} />;
};
export default ChatItem;

export interface ChatItemProps {
  content: ReactNode;
  time: Date;
  receive?: boolean;
}
