import { faCircleCheck, faCircleXmark } from '@fortawesome/free-regular-svg-icons';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { FC, ReactNode } from 'react';

const iconMap = Object.freeze({
  faild: faCircleXmark,
  receive: faCircleCheck,
  send: faCircleCheck,
  waiting: faSpinner,
});

const getTime = (datetime: Date) => datetime.toLocaleString().split(' ').pop();

const Failed: FC<Omit<ChatItemProps, 'receive'>> = ({ content, footer }) => (
  <div className="chat-wrapper justify-end">
    <div className="bg-rose-400 chat-container rounded-tr-none">
      <p className="chat-content text-white">{content}</p>
      <p className="chat-footer text-yellow-300">
        <span>faild</span>
        <span>{footer}</span>
      </p>
      <div className="-right-1 border-l-4 border-l-rose-400 chat-corner" />
    </div>
  </div>
);

const Receive: FC<Omit<ChatItemProps, 'receive'>> = ({ content, footer, time }) => (
  <div className="chat-wrapper justify-start">
    <div className="bg-white chat-container rounded-tl-none">
      <p className="chat-content text-slate-800">{content}</p>
      <p className="chat-footer text-slate-400">
        <span className="text-green-500">{footer}</span>
        <span>{getTime(time)}</span>
      </p>
      <div className="-left-1 border-r-4 border-r-white chat-corner" />
    </div>
  </div>
);

const Send: FC<Omit<ChatItemProps, 'receive'>> = ({ content, footer, time }) => (
  <div className="chat-wrapper justify-end">
    <div className="bg-blue-600 chat-container rounded-tr-none">
      <p className="chat-content text-white">{content}</p>
      <p className="chat-footer text-slate-400">
        <span>{getTime(time)}</span>
        <span className="text-blue-400">{footer}</span>
      </p>
      <div className="-right-1 border-l-4 border-l-blue-600 chat-corner" />
    </div>
  </div>
);

const Waiting: FC<Omit<ChatItemProps, 'receive'>> = ({ content, footer }) => (
  <div className="chat-wrapper justify-end">
    <div className="bg-blue-600 chat-container rounded-tr-none">
      <p className="chat-content text-white">{content}</p>
      <p className="chat-footer text-slate-400">
        <span>waiting</span>
        <span className="text-blue-400">{footer}</span>
      </p>
      <div className="-right-1 border-l-4 border-l-blue-600 chat-corner" />
    </div>
  </div>
);

const chatMap = Object.freeze({
  faild: Failed,
  receive: Receive,
  send: Send,
  waiting: Waiting,
});

const ChatItem: FC<ChatItemProps> = ({ type, ...props }) => {
  const TimeCom = chatMap[type];
  return (
    <TimeCom
      {...props}
      footer={
        <FontAwesomeIcon
          className={type === 'waiting' ? 'animate-spin' : undefined}
          icon={iconMap[type]}
        />
      }
      type={type}
    />
  );
};
export default ChatItem;

export interface ChatItemProps {
  content: ReactNode;
  time: Date;
  type: keyof typeof chatMap;
  footer?: ReactNode;
}
