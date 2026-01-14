import { type FC, useEffect, useRef, useState } from 'react';
import { type CategoryListProps, getCatalogItemStyle } from '../utils/list';

const FloatingList: FC<CategoryListProps> = ({ list, scrollTo }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const allowRef = useRef(true);
  useEffect(() => {
    function closeHandle() {
      if (allowRef.current) {
        setIsExpanded(false);
      } else {
        allowRef.current = true;
      }
    }

    function stopClose(event: Event) {
      const { target } = event;
      allowRef.current = false;
      if (target instanceof HTMLElement && target.closest('.control-btn')) {
        setIsExpanded((current) => !current);
      }
    }
    const floatingList = document.querySelector('.floating-list');
    if (floatingList) floatingList.addEventListener('click', stopClose);
    document.body.addEventListener('click', closeHandle);
    return () => {
      document.body.removeEventListener('click', closeHandle);

      if (floatingList) floatingList.addEventListener('click', stopClose);
      allowRef.current = true;
      setIsExpanded(false);
    };
  }, [setIsExpanded]);

  return (
    <div className="floating-list fixed right-6 bottom-6 z-50">
      <div className="relative flex flex-col items-end">
        <button
          className={`control-btn flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-gray-800 text-white shadow-md transition-all duration-300 hover:bg-gray-700 active:bg-gray-900 ${isExpanded ? 'pointer-events-none inset-0 translate-y-10 opacity-0' : 'pointer-events-auto opacity-100'} `}
          aria-label={isExpanded ? '收起清单' : '展开清单'}
        >
          <svg
            className="pointer-events-none h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
        </button>
        <div
          className={`overflow-hidden transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-96 scale-100 opacity-100' : 'max-h-0 scale-95 opacity-0'} w-64 rounded-lg border border-gray-100 bg-white shadow-xl`}
        >
          <button className="control-btn flex w-full cursor-pointer items-center justify-between px-4 py-3 text-gray-700 transition-colors hover:bg-gray-50">
            <span className="font-medium">文档目录</span>
            <svg
              className="pointer-events-none h-4 w-4 rotate-180 text-gray-500 transition-transform duration-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
          <div className="max-h-84 overflow-y-auto">
            <ul className="m-0 border-t border-gray-100 px-2 py-2">
              {list.map(({ name, tag, title }) => {
                const { indent, color } = getCatalogItemStyle(tag);
                return (
                  <li
                    className={` ${indent} ${color} sb-anchor cursor-pointer rounded-md py-2 text-sm transition-colors hover:bg-gray-50 hover:text-gray-900`}
                    key={name}
                    onClick={() => scrollTo?.(name)}
                  >
                    {title}
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FloatingList;
