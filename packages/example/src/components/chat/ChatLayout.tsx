import type { FC, PropsWithChildren, ReactNode } from 'react';

const ChatLayout: FC<PropsWithChildren<ChatLayoutProps>> = ({
  children,
  extra,
  title,
  footer = 120,
}) => (
  <div className={`gap-4 grid grid-rows-[24px_1fr_${footer}px]`}>
    <div className="border-l-4 border-sky-500 box-border leading-6 pl-3">{title}</div>
    <div>{children}</div>
    {extra && (
      <div className="bg-amber-200 box-border h-full overflow-x-auto p-2 rounded-md text-red-500 text-sm w-full">
        {extra}
      </div>
    )}
  </div>
);

export default ChatLayout;

interface ChatLayoutProps {
  extra?: ReactNode;
  footer?: number;
  title?: ReactNode;
}
