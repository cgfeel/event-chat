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
          className={`
            control-btn w-10 h-10 rounded-full bg-gray-800 text-white border-2 border-white 
            flex items-center justify-center shadow-md 
            hover:bg-gray-700 active:bg-gray-900 transition-all duration-300
            ${isExpanded ? 'opacity-0 pointer-events-none inset-0 translate-y-10' : 'opacity-100 pointer-events-auto'}
          `}
          aria-label={isExpanded ? '收起清单' : '展开清单'}
        >
          <svg
            className="w-5 h-5 pointer-events-none"
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
          className={`
            overflow-hidden transition-all duration-300 ease-in-out
            ${isExpanded ? 'max-h-96 opacity-100 scale-100' : 'max-h-0 opacity-0 scale-95'}
            bg-white rounded-lg shadow-xl border border-gray-100 w-64
          `}
        >
          <button className="control-btn cursor-pointer w-full flex items-center justify-between px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors">
            <span className="font-medium">文档目录</span>
            <svg
              className="w-4 h-4 text-gray-500 rotate-180 transition-transform duration-300 pointer-events-none"
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
            <ul className="px-2 py-2 m-0 border-t border-gray-100">
              {list.map(({ name, tag, title }) => {
                const { indent, color } = getCatalogItemStyle(tag);
                return (
                  <li
                    className={`
                  ${indent} ${color}
                  sb-anchor py-2 text-sm hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors cursor-pointer`}
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
