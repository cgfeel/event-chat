import {
  Children,
  type FC,
  type JSXElementConstructor,
  type PropsWithChildren,
  type ReactElement,
  type ReactNode,
  type ReactPortal,
  cloneElement,
  createContext,
  isValidElement,
  memo,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { cn, tv } from 'tailwind-variants';

const borderStyle = 'border-r border-b border-gray-200 last:border-r-0';
const stickyStyle = 'sticky left-0 z-10';
const stickyHeaderStyle = 'sticky top-0 z-20 bg-gray-100';

const tableStyles = tv({
  slots: {
    bodyWrap: '',
    headerWrap: '',
    table: 'w-full border-separate border-spacing-0 text-sm',
    tbody: '',
    td: 'text-gray-800',
    th: 'font-semibold text-gray-700',
    thead: 'bg-gray-100',
    tr: '',
    wrap: 'w-full overflow-x-auto rounded-tl-sm rounded-tr-sm border-t border-r border-l border-gray-200',
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
      slots: ['headerWrap'],
      stickyHeader: true,
      class: stickyHeaderStyle,
    },
    {
      slots: ['bodyWrap'],
      stickyHeader: true,
      class: 'overflow-y-auto',
    },
    {
      slots: ['table'],
      stickyHeader: true,
      class: 'table-fixed',
    },
    {
      slots: ['td', 'th'],
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
  ],
});

const TableContext = createContext<{
  columnWidths: number[];
  style: ReturnType<typeof tableStyles>;
}>({
  columnWidths: [],
  style: tableStyles(),
});

const Colgroup: FC = () => {
  const { columnWidths } = useContext(TableContext);
  return (
    <colgroup>
      {columnWidths.map((item, idx) => (
        <col key={idx} style={{ width: `${item}px` }} />
      ))}
    </colgroup>
  );
};

const ColumnWidthCalculator: FC<{ children: ReactNode }> = ({ children }) => {
  const { style } = useContext(TableContext);
  return (
    <div className="invisible absolute">
      <table className={style.table()}>
        <Colgroup />
        {children}
      </table>
    </div>
  );
};

const Table: FC<PropsWithChildren<TableProps>> = ({
  children,
  className,
  align = 'left',
  border = true,
  maxHeight = '400px',
  stickyHeader = false,
}) => {
  const style = tableStyles({ align, border, stickyHeader });
  const { table, wrap, headerWrap, bodyWrap } = className ?? {};
  const [columnWidths, setColumnWidths] = useState<number[]>([]);

  const headerRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);

  let theadContent: ReactNode = null;
  let tbodyContent: ReactNode = null;
  let theadOriginal = null as
    | ReactPortal
    | ReactElement<unknown, string | JSXElementConstructor<unknown>>
    | null;

  const bodyStyle = stickyHeader
    ? { maxHeight: typeof maxHeight === 'number' ? `${maxHeight}px` : maxHeight }
    : undefined;

  Children.forEach(children, (child) => {
    if (isValidElement(child)) {
      if (child.type === Thead) {
        theadOriginal = child;
      } else if (child.type === TBody) {
        tbodyContent = child;
      }
    }
  });

  if (stickyHeader && theadOriginal) {
    const headProps = theadOriginal.props as unknown as { className: string | undefined };
    theadContent = cloneElement(theadOriginal, {
      ref: headerRef,
      className: cn([style.headerWrap({ class: headerWrap }), headProps.className]),
    });
  }

  useEffect(() => {
    if (!stickyHeader || !headerRef.current || !bodyRef.current) return;

    const body = bodyRef.current;
    const header = headerRef.current;

    const handleScroll = () => {
      header.scrollLeft = body.scrollLeft;
    };

    body.addEventListener('scroll', handleScroll);
    return () => body.removeEventListener('scroll', handleScroll);
  }, [stickyHeader]);

  useEffect(() => {
    if (!stickyHeader || !bodyRef.current) return;

    const tableElem = bodyRef.current.querySelector('table');
    if (!tableElem) return;

    const firstRow = tableElem.querySelector('tbody tr');
    if (!firstRow) return;

    const cells = Array.from(firstRow.children);
    const widths = cells.map((cell) => cell.getBoundingClientRect().width);
    setColumnWidths(widths);
  }, [stickyHeader, children]);

  return (
    <TableContext.Provider value={{ columnWidths, style }}>
      <div className={cn([style.wrap({ class: wrap }), className])}>
        {stickyHeader ? (
          <>
            <table className={style.table({ class: table })}>
              <Colgroup />
              {theadContent}
            </table>
            <ColumnWidthCalculator>{theadOriginal}</ColumnWidthCalculator>
            <div className={style.bodyWrap({ class: bodyWrap })} ref={bodyRef} style={bodyStyle}>
              <table className={style.table({ class: table })}>
                <Colgroup />
                {tbodyContent}
              </table>
            </div>
          </>
        ) : (
          <table className={style.table({ class: table })}>{children}</table>
        )}
      </div>
    </TableContext.Provider>
  );
};

const TBody: FC<PropsWithChildren<TableBaseProps>> = ({ children, className }) => {
  const { style } = useContext(TableContext);
  return <tbody className={cn([style.tbody(), className])}>{children}</tbody>;
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
  const { style } = useContext(TableContext);
  return <thead className={cn([style.thead(), className])}>{children}</thead>;
};

const Tr: FC<PropsWithChildren<TableBaseProps>> = ({ children, className }) => {
  const { columnWidths, style } = useContext(TableContext);
  const childrenWithWidth =
    columnWidths.length > 0
      ? Children.map(children, (child, index) => {
          if (isValidElement(child) && index < columnWidths.length) {
            const childProps = child.props as unknown as { style: StyleSheet };
            return cloneElement(child, {
              style: {
                ...childProps.style,
                minWidth: `${columnWidths[index]}px`,
                maxWidth: `${columnWidths[index]}px`,
              },
            });
          }
          return child;
        })
      : children;

  return <tr className={cn([style.tr(), className])}>{childrenWithWidth}</tr>;
};

export { TBody, Td, Th, Thead, Tr };

export default memo(Table);

interface TableBaseProps {
  className?: string;
}

interface TableProps {
  align?: 'left' | 'right';
  border?: boolean;
  className?: Partial<Record<'headerWrap' | 'bodyWrap' | 'table' | 'wrap', string>>;
  maxHeight?: string | number;
  stickyHeader?: boolean;
}

interface TableCellProps extends TableBaseProps {
  sticky?: boolean;
}
