import type { FC, ReactNode } from 'react';
import Tag from './Tag';

const TableList: FC<TableListProps> = ({ data }) => (
  <table className="sb-anchor w-full border-collapse text-sm">
    <thead>
      <tr className="bg-gray-100">
        <th className="py-3 px-4 border border-gray-200 text-left font-semibold text-gray-700">
          参数/属性
        </th>
        <th className="py-3 px-4 border border-gray-200 text-left font-semibold text-gray-700">
          说明
        </th>
        <th className="py-3 px-4 border border-gray-200 text-left font-semibold text-gray-700">
          类型
        </th>
      </tr>
    </thead>
    <tbody className="divide-y divide-gray-200">
      {data.map(({ desc, keyname, type }) => (
        <tr className="hover:bg-gray-50" key={keyname}>
          <td className="py-3 px-4 border border-gray-200 text-gray-800">{keyname}</td>
          <td className="py-3 px-4 border border-gray-200 text-gray-600">
            {desc === undefined || desc === '' ? '--' : desc}
          </td>
          <td className="py-3 px-4 border border-gray-200 text-gray-600">
            <div className="flex-col gap-1 inline-flex items-start">
              {type?.map((typeItem) => (typeItem ? <Tag key={typeItem}>{typeItem}</Tag> : null)) ??
                '--'}
            </div>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
);

export default TableList;

interface TableListProps {
  data: DataItemType[];
}

type DataItemType = {
  keyname: string;
  desc?: ReactNode;
  type?: string[];
};
