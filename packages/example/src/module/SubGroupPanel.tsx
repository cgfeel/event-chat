import type { FC } from 'react';

const GroupItem: FC = () => (
  <div className={`bg-slate-800 grid grid-rows-[80px_1fr] h-60 p-2 rounded-md shadow-md`}>item</div>
);

const SubGroup: FC = () => (
  <div className="gap-4 grid grid-cols-1">
    <GroupItem />
    <GroupItem />
  </div>
);

export default SubGroup;
