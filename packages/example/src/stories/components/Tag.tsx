import type { FC, PropsWithChildren } from 'react';

const colorMap = Object.freeze({
  danger: 'text-red-700',
  default: 'text-gray-700',
  info: 'text-blue-700',
  success: 'text-green-700',
  warning: 'text-yellow-700',
});

const Tag: FC<PropsWithChildren<TagProps>> = ({ children, type = 'default' }) => {
  const color = colorMap[type];
  return (
    <span
      className={`sb-anchor inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 ${color}`}
    >
      {children}
    </span>
  );
};

export default Tag;

interface TagProps {
  type?: keyof typeof colorMap;
}
