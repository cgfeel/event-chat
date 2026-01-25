import {
  type FC,
  type PropsWithChildren,
  type RefObject,
  createContext,
  memo,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { cn, tv } from 'tailwind-variants';

const borderStyle = 'border-r border-b border-gray-200 last:border-r-0';
const stickyStyle = 'sticky left-0 z-10';
const stickyHeaderStyle = 'sticky top-0 z-20 bg-gray-100';

const bodyWrap = 'body-wrap';
const headerWrap = 'header-wrap';
const tableName = 'custom-table';

const tableStyles = tv({
  slots: {
    bodyWrap: '',
    col: '',
    headerWrap: '',
    table: 'w-full border-separate border-spacing-0 text-sm',
    tbody: '',
    td: 'text-gray-800',
    th: 'font-semibold text-gray-700',
    thead: 'bg-gray-100',
    tr: '',
    wrap: `${tableName} w-full rounded-tl-sm rounded-tr-sm border-t border-r border-l border-gray-200`,
  },
  variants: {
    align: {
      left: '',
      right: '',
    },
    border: {
      true: '',
    },
    sticky: {
      true: '',
    },
    stickyHeader: {
      true: '',
    },
  },
  compoundSlots: [
    {
      slots: ['bodyWrap'],
      stickyHeader: true,
      class: 'overflow-auto',
    },
    {
      slots: ['headerWrap'],
      stickyHeader: true,
      class: stickyHeaderStyle,
    },
    {
      slots: ['table'],
      stickyHeader: true,
      class: 'w-max min-w-full table-auto',
    },
    {
      slots: ['col', 'td', 'th'],
      className: 'px-4 py-3',
    },
    {
      slots: ['td', 'th'],
      align: 'left',
      class: 'text-left',
    },
    {
      slots: ['td', 'th'],
      align: 'right',
      class: 'text-right',
    },
    {
      slots: ['td', 'th'],
      border: true,
      class: borderStyle,
    },
    {
      slots: ['td', 'th'],
      sticky: true,
      class: stickyStyle,
    },
    {
      slots: ['td'],
      sticky: true,
      class: 'bg-white',
    },
    {
      slots: ['th'],
      sticky: true,
      class: 'bg-gray-100',
    },
    {
      slots: ['td'],
      stickyHeader: true,
      class: 'bg-last:td:border-b-none',
    },
    {
      slots: ['wrap'],
      stickyHeader: false,
      class: 'overflow-x-auto',
    },
    {
      slots: ['wrap'],
      stickyHeader: undefined,
      class: 'overflow-x-auto',
    },
    {
      slots: ['wrap'],
      stickyHeader: true,
      class: 'overflow-hidden border-b',
    },
  ],
});

const ColgroupContext = createContext<ColgroupContextInstance>({
  columnWidths: [],
});

const TableContext = createContext<TableContextInstance>({
  style: tableStyles(),
});

const Colgroup: FC = () => {
  const style = tableStyles();
  const { columnWidths, minWidth } = useContext(ColgroupContext);
  const width = parseInt(String(minWidth ?? 800), 10);

  return (
    <colgroup>
      {columnWidths.map((item, idx) => {
        const keyname = `${idx}:${Math.random()}`;
        return (
          <col
            className={cn([item, style.col()])}
            key={keyname}
            style={
              item
                ? undefined
                : { width: Number.isNaN(width) ? '200px' : `${width / columnWidths.length}px` }
            }
          />
        );
      })}
    </colgroup>
  );
};

const ColgroupProvider: FC<PropsWithChildren<ColgroupProviderProps>> = ({
  children,
  minWidth,
  wrap,
}) => {
  const [columnWidths, setColumnWidths] = useState<ColgroupContextInstance['columnWidths']>([]);
  useEffect(() => {
    const tableWrap = wrap.current;
    const firstRow =
      tableWrap?.querySelector(`.${bodyWrap} tbody tr`) ??
      tableWrap?.querySelector(`.${headerWrap} thead th`);

    if (!firstRow) return;

    const cells = Array.from(firstRow.children);
    const widths = cells.map((cell) => {
      const className = cell.getAttribute('class');
      return className ? /(w-[^\s]+)/.exec(className)?.[0] : undefined;
    });

    setColumnWidths(widths);
  }, [wrap, setColumnWidths]);

  return (
    <ColgroupContext.Provider value={{ columnWidths, minWidth }}>
      {children}
    </ColgroupContext.Provider>
  );
};

const Table: FC<PropsWithChildren<TableProps>> = ({
  children,
  className,
  align = 'left',
  border = true,
  maxHeight = '400px',
  minWidth = '800px',
  stickyHeader = false,
}) => {
  const style = tableStyles({ align, border, stickyHeader });
  const { table, wrap } = className ?? {};
  const wrapRef = useRef<HTMLDivElement>(null);

  return (
    <TableContext.Provider value={{ maxHeight, stickyHeader, style, table }}>
      <ColgroupProvider minWidth={minWidth} wrap={wrapRef}>
        <div className={cn([style.wrap({ class: wrap }), className])} ref={wrapRef}>
          {stickyHeader ? (
            children
          ) : (
            <table className={style.table({ class: table })}>{children}</table>
          )}
        </div>
      </ColgroupProvider>
    </TableContext.Provider>
  );
};

const TBody: FC<PropsWithChildren<TableBaseProps>> = ({ children, className }) => {
  const { maxHeight, stickyHeader, style, table } = useContext(TableContext);

  const bodyRef = useRef<HTMLDivElement>(null);
  const bodyStyle = useMemo(
    () =>
      stickyHeader
        ? {
            maxHeight: typeof maxHeight === 'number' ? `${maxHeight}px` : maxHeight,
          }
        : undefined,
    [maxHeight, stickyHeader]
  );

  useEffect(() => {
    const currentBody = bodyRef.current;
    const tableWrap = currentBody?.closest(`.${tableName}`);
    const thead = tableWrap?.querySelector(`.${headerWrap}`);

    function scrollHandle() {
      if (thead) thead.scrollLeft = currentBody?.scrollLeft ?? 0;
    }

    currentBody?.addEventListener('scroll', scrollHandle);
    return () => {
      currentBody?.removeEventListener('scroll', scrollHandle);
    };
  }, []);

  return !stickyHeader ? (
    <tbody className={cn([style.tbody(), className])}>{children}</tbody>
  ) : (
    <div
      className={cn([style.bodyWrap({ class: className }), bodyWrap])}
      ref={bodyRef}
      style={bodyStyle}
    >
      <table className={style.table({ class: table })}>
        <Colgroup />
        <tbody className={cn([style.tbody(), className])}>{children}</tbody>
      </table>
    </div>
  );
};

const Td: FC<PropsWithChildren<TableCellProps>> = ({ children, className, sticky }) => {
  const { style } = useContext(TableContext);
  return <td className={cn([style.td({ sticky }), className])}>{children}</td>;
};

const Th: FC<PropsWithChildren<TableCellProps>> = ({ children, className, sticky }) => {
  const { style } = useContext(TableContext);
  return <th className={cn([style.th({ sticky }), className])}>{children}</th>;
};

const Thead: FC<PropsWithChildren<TableBaseProps>> = ({ children, className }) => {
  const headerRef = useRef<HTMLDivElement>(null);
  const { stickyHeader, style, table } = useContext(TableContext);

  useEffect(() => {
    const currentHeader = headerRef.current;
    const tableWrap = currentHeader?.closest(`.${tableName}`);
    const tbody = tableWrap?.querySelector(`.${bodyWrap}`);

    function scrollHandle() {
      if (tbody) tbody.scrollLeft = currentHeader?.scrollLeft ?? 0;
    }

    currentHeader?.addEventListener('scroll', scrollHandle);
    return () => {
      currentHeader?.removeEventListener('scroll', scrollHandle);
    };
  }, [headerRef, stickyHeader]);

  return !stickyHeader ? (
    <thead className={cn([style.thead(), className])}>{children}</thead>
  ) : (
    <div
      className={cn([style.bodyWrap({ class: className }), `${headerWrap} no-scrollbar`])}
      ref={headerRef}
    >
      <table className={style.table({ class: table })}>
        <Colgroup />
        <thead className={cn([style.headerWrap({ class: className }), style.thead()])}>
          {children}
        </thead>
      </table>
    </div>
  );
};

const Tr: FC<PropsWithChildren<TableBaseProps>> = ({ children, className }) => {
  const { style } = useContext(TableContext);
  return <tr className={cn([style.tr(), className])}>{children}</tr>;
};

export { TBody, Td, Th, Thead, Tr };

export default memo(Table);

interface ColgroupContextInstance extends Pick<TableProps, 'minWidth'> {
  columnWidths: Array<string | undefined>;
}

interface ColgroupProviderProps extends Pick<TableProps, 'minWidth'> {
  wrap: RefObject<HTMLDivElement>;
}

interface TableBaseProps {
  className?: string;
}

interface TableContextInstance extends Pick<TableProps, 'maxHeight' | 'stickyHeader'> {
  style: ReturnType<typeof tableStyles>;
  table?: string;
}

interface TableProps {
  align?: 'left' | 'right';
  border?: boolean;
  className?: Partial<Record<'table' | 'wrap', string>>;
  maxHeight?: string | number;
  minWidth?: string | number;
  stickyHeader?: boolean;
}

interface TableCellProps extends TableBaseProps {
  sticky?: boolean;
}
