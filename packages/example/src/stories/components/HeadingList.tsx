import type { FC } from 'react';
import { type CategoryListProps, getCatalogItemStyle } from '../utils/list';

export const HeadingList: FC<CategoryListProps> = ({ list, scrollTo }) => {
  return (
    <ul className="space-y-2">
      {list.map(({ name, tag, title }) => {
        const { indent, fontSize, color } = getCatalogItemStyle(tag);
        return (
          <li
            className={` ${indent} ${fontSize} ${color} sb-anchor cursor-pointer rounded-md transition-colors hover:bg-gray-50`}
            key={name}
          >
            <a className="flex items-center text-blue-500" onClick={() => scrollTo?.(name)}>
              {title}
            </a>
          </li>
        );
      })}
    </ul>
  );
};

export default HeadingList;
