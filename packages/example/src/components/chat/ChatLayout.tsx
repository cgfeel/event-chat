import type { FC, PropsWithChildren, ReactNode } from 'react';

const ChatLayout: FC<PropsWithChildren<ChatLayoutProps>> = ({
  children,
  extra,
  title,
  footer = 120,
}) => (
  <div className={`grid gap-4 grid-rows-[24px_1fr_${footer}px]`}>
    <div className="box-border border-l-4 border-sky-500 pl-3 leading-6">{title}</div>
    <div>{children}</div>
    {extra && (
      <div className="box-border h-full w-full overflow-x-auto rounded-md bg-amber-200 p-2 text-sm text-red-500">
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
