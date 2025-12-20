import type { FC, ReactNode } from 'react';

const Layout: FC<LayoutProps> = ({ list, title }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <div className="md:col-span-2">
      <h2 className="text-3xl font-bold underline">{title}</h2>
    </div>
    {list?.map((item, idx) => {
      const keyname = `${idx}:${Math.random()}`;
      return <div key={keyname}>{item}</div>;
    })}
  </div>
);

export default Layout;

interface LayoutProps {
  list?: ReactNode[];
  title?: ReactNode;
}
