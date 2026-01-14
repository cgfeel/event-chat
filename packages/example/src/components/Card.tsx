import type { FC, PropsWithChildren, ReactNode } from 'react';

const Card: FC<PropsWithChildren<CardProps>> = ({ children, footer, title }) =>
  title ? (
    <div className="relative p-4">
      <div className="absolute inset-[-1] -z-1 rounded-md border border-gray-600 bg-transparent [clip-path:polygon(0_0,20px_0,20px_2px,calc(100%-20px)_2px,calc(100%-20px)_0,100%_0,100%_100%,0_100%)]" />
      <div className="absolute top-[-14] right-0 left-5 flex h-7 flex-nowrap items-center gap-2 px-2 py-1 text-sm font-medium break-keep">
        <div className="flex-basis-auto max-w-120 shrink-0 grow-0 overflow-hidden break-keep text-ellipsis whitespace-nowrap">
          {title}
        </div>
        <hr className="flex-basis-auto w-full shrink grow translate-y-[-0.5px] border-0 border-t border-gray-600" />
      </div>
      {children}
      {footer}
    </div>
  ) : (
    <div className="relative rounded-md border border-gray-600 p-4">
      {children}
      {footer}
    </div>
  );

export default Card;

interface CardProps {
  footer?: ReactNode;
  title?: ReactNode;
}
