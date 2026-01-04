import { useEventChat } from '@event-chat/core';
import {
  type FC,
  type PropsWithChildren,
  createContext,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react';
import z from 'zod';
import { tabItem, tabsContainer, tabsPick } from '@/utils/event';

const TabContext = createContext({ group: '' });

const TabItem: FC<PropsWithChildren<TabItemProps>> = ({ children, name }) => {
  const [active, setActive] = useState(false);
  const id = useId();

  const takeKey = useMemo(() => name ?? id, [id, name]);
  const { group } = useContext(TabContext);
  const { emit } = useEventChat(tabItem, {
    callback: ({ detail }) => setActive(detail === takeKey),
    group,
  });

  useEffect(() => {
    if (active) emit({ name: tabsPick });
  }, [active, emit]);

  return (
    <li className={active ? 'active' : undefined}>
      <button
        className="text-slate-900 hover:text-slate-600 rounded-sm px-2 py-1 text-sm font-medium focus-visible:ring-2 transition duration-200 focus:outline-none"
        type="button"
        onClick={() => {
          if (!active) emit({ detail: takeKey, name: tabsContainer });
        }}
      >
        {children}
      </button>
    </li>
  );
};

const Tabs: FC<PropsWithChildren<TabsProps>> = ({
  active,
  defaultActive,
  children,
  group: groupKey,
  onChange,
}) => {
  const [defaultActiveKey] = useState(defaultActive);
  const wrapRef = useRef<HTMLDivElement>(null);
  const defaultGroup = useId();

  const group = useMemo(() => groupKey ?? defaultGroup, [defaultGroup, groupKey]);
  const { emit } = useEventChat(tabsContainer, {
    schema: z.union([z.string(), z.number(), z.symbol()]),
    callback: ({ detail }) => {
      if (active === undefined) {
        emit({ name: tabItem, detail });
        onChange?.(detail);
      }
    },
    group,
  });

  // onChange 一定会 pick，但 pick 不一定会 onChange
  useEventChat(tabsPick, {
    callback: () => {
      const dataSider = wrapRef.current?.querySelector('[data-slider]');
      const tab = wrapRef.current?.querySelector('.active');

      if (!(dataSider instanceof HTMLElement)) return;
      if (tab instanceof HTMLElement) {
        dataSider.style.setProperty('--selected-item-width', `${tab.clientWidth}px`);
        dataSider.style.setProperty('--selected-item-position', `${tab.offsetLeft}px`);
      } else {
        dataSider.style.setProperty('--selected-item-width', '0');
        dataSider.style.setProperty('--selected-item-position', '0');
      }
    },
    group,
  });

  useEffect(() => {
    emit({ detail: active ?? defaultActiveKey, name: tabItem });
  }, [active, defaultActiveKey, emit]);

  return (
    <div className="relative rounded transform-[translateZ(0)]" ref={wrapRef}>
      <nav className="tabs-container relative w-full rounded border bg-slate-100 p-1">
        <div className="relative">
          <div
            className="absolute h-full w-(--selected-item-width) translate-x-(--selected-item-position) rounded-sm bg-white transition-[width,translate] duration-300 border border-slate-300 shadow-sm"
            data-slider
          />
          <ul className="relative flex items-center gap-1">
            <TabContext.Provider value={{ group }}>{children}</TabContext.Provider>
          </ul>
        </div>
      </nav>
    </div>
  );
};

export { TabItem };

export default Tabs;

interface TabItemProps {
  name?: PropertyKey;
}

interface TabsProps {
  active?: PropertyKey;
  defaultActive?: PropertyKey;

  // 主控 tabs 时允许设置 group 从而切换的 item 项，添加相同的 group 来监听切换
  group?: string;
  onChange?: (key: PropertyKey) => void;
}
