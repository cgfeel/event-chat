import { type FC, type PropsWithChildren, type RefObject, useState } from 'react';

const ChatPanel: FC<PropsWithChildren<ChatPanelProps>> = ({
  children,
  rollRef,
  onChange,
  wraper = 'h-120',
}) => {
  const [value, setValue] = useState('');
  return (
    <div className={`bg-slate-800 grid grid-rows-[1fr_80px] p-2 rounded-md shadow-md ${wraper}`}>
      <div className="h-full overflow-y-auto p-2" ref={rollRef}>
        {children}
      </div>
      <div className="bg-slate-950 grid grid-cols-6 gap-2 p-2 rounded-md">
        <div className="col-span-5 overflow-hidden">
          <textarea
            className="bg-slate-50 box-border h-full p-2 rounded-md resize-none text-stone-950 w-full"
            placeholder="Please input..."
            value={value}
            onChange={({ target }) => setValue(target.value)}
          />
        </div>
        <div>
          <button
            className="active:bg-green-700 bg-green-600 cursor-pointer disabled:bg-slate-500 disabled:cursor-default h-full hover:bg-green-500 rounded-md shadow-md w-full"
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
