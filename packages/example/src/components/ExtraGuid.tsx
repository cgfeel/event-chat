import type { FC, PropsWithChildren, ReactNode } from 'react';

const ExtraGuid: FC<PropsWithChildren<ExtraGuidProps>> = ({ children, title = '提示：' }) => (
  <div className="bg-amber-200 h-full p-2 rounded-md text-red-500 text-sm w-full">
    <div>{title}</div>
    <pre>{children}</pre>
  </div>
);

export default ExtraGuid;

interface ExtraGuidProps {
  title?: ReactNode;
}
