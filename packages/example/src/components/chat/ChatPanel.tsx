import { type FC, type PropsWithChildren, type RefObject, useState } from 'react';

const ChatPanel: FC<PropsWithChildren<ChatPanelProps>> = ({
  children,
  rollRef,
  onChange,
  wraper = 'h-120',
}) => {
  const [value, setValue] = useState('');
  return (
    <div className={`grid grid-rows-[1fr_80px] rounded-md bg-slate-800 p-2 shadow-md ${wraper}`}>
      <div className="h-full overflow-y-auto p-2" ref={rollRef}>
        {children}
      </div>
      <div className="grid grid-cols-6 gap-2 rounded-md bg-slate-950 p-2">
        <div className="col-span-5 overflow-hidden">
          <textarea
            className="box-border h-full w-full resize-none rounded-md bg-slate-50 p-2 text-stone-950"
            placeholder="Please input..."
            value={value}
            onChange={({ target }) => setValue(target.value)}
          />
        </div>
        <div>
          <button
            className="h-full w-full cursor-pointer rounded-md bg-green-600 shadow-md hover:bg-green-500 active:bg-green-700 disabled:cursor-default disabled:bg-slate-500"
            disabled={!value}
            type="button"
            onClick={() => {
              onChange?.(value);
              setValue('');
            }}
          >
            send
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatPanel;

interface ChatPanelProps {
  rollRef?: RefObject<HTMLDivElement>;
  wraper?: string;
  onChange?: (message: string) => void;
}
