import type { FC, PropsWithChildren, ReactNode } from 'react';

const Card: FC<PropsWithChildren<CardProps>> = ({ children, title }) =>
  title ? (
    <div className="relative p-4">
      <div className="absolute inset-[-1] border border-gray-600 rounded-md bg-transparent [clip-path:polygon(0_0,20px_0,20px_2px,calc(100%-20px)_2px,calc(100%-20px)_0,100%_0,100%_100%,0_100%)] -z-1" />
      <div className="absolute top-[-14] left-5 right-0 flex flex-nowrap break-keep gap-2 items-center px-2 py-1 text-sm font-medium h-7">
        <div className="whitespace-nowrap break-keep overflow-hidden text-ellipsis max-w-50 grow-0 shrink-0 flex-basis-auto">
          {title}
        </div>
        <hr className="border-0 border-gray-600 border-t w-full translate-y-[-0.5px] grow shrink flex-basis-auto" />
      </div>
      {children}
    </div>
  ) : (
    <div className="relative p-4 rounded-md border border-gray-600">{children}</div>
  );

export default Card;

interface CardProps {
  title?: ReactNode;
}
