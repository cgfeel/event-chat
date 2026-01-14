import type { FC } from 'react';
import { isKey } from '@/utils/fields';
import type { ChatItemType } from '../utils';

const statusMap = Object.freeze({
  error: '👾 [error] 操作异常',
  faild: '😞 [faild] 处理失败',
  success: '😎 [success] 完成处理',
  waiting: '⏳️ [waiting] 处理中',
});

const bgColorMap = [
  'bg-amber-600',
  'bg-fuchsia-600',
  'bg-gray-600',
  'bg-lime-600',
  'bg-rose-600',
] as const;

const textColorMap = [
  'text-amber-600',
  'text-fuchsia-600',
  'text-gray-600',
  'text-lime-600',
  'text-rose-600',
] as const;

const getColor = <T extends string>(colorMap: readonly T[], id?: string) =>
  colorMap[
    (id?.replace(/=/g, '').slice(-1).charCodeAt(0) ?? Number(String(Math.random()).slice(-1))) %
      colorMap.length
  ];

const RenderCard: FC<RenderCardProps> = ({ item: { description, id, ingredients, title } }) => {
  const bgcolor = getColor(bgColorMap, id);
  const textcolor = getColor(textColorMap, id);
  return (
    <div className="card-shadow overflow-hidden rounded-xl bg-white transition-transform duration-300 hover:scale-[1.02]">
      <div className={`${bgcolor} p-6 text-white`}>
        <h2 className="mb-1 text-2xl font-bold">{title}</h2>
        <p className="text-sm text-amber-200">食谱 ID：{id}</p>
      </div>
      <div className="p-6">
        <div className="mb-5">
          <h3 className="mb-3 flex items-center text-lg font-semibold text-gray-800">
            <svg
              className={`mr-2 h-5 w-5 ${textcolor}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4"
              />
            </svg>
            食材清单
          </h3>
          <ul className="space-y-2 text-gray-700">
            {ingredients.map((ingredient, idx) => {
              const keyname = `${ingredient}:${idx}`;
              return (
                <li className="flex items-center" key={keyname}>
                  <span className={`h-2 w-2 rounded-full ${bgcolor} mr-2`} />
                  {ingredient}
                </li>
              );
            })}
          </ul>
        </div>
        {description && (
          <div className="rounded-lg bg-gray-100 p-4 text-gray-600">
            <h3 className="mb-2 text-lg font-semibold text-gray-800">食谱描述</h3>
            <p>{description}</p>
          </div>
        )}
      </div>
    </div>
  );
};

const RenderMessage: FC<RenderMessageProps> = ({ item: { message, status } }) => {
  const typeKey = isKey(status, statusMap) ? status : 'error';
  return <>{[statusMap[typeKey], message].filter(Boolean).join(': ')}</>;
};

const RenderSchema: FC<RenderReviceProps> = ({ item }) =>
  'message' in item && item.message !== undefined ? (
    <RenderMessage item={item} />
  ) : (
    <RenderCard item={item} />
  );

export default RenderSchema;

interface RenderCardProps {
  item: ChatItemType['content'] & { message?: never };
}

interface RenderMessageProps {
  item: ChatItemType['content'] & { message: string };
}

interface RenderReviceProps {
  item: ChatItemType['content'];
}
