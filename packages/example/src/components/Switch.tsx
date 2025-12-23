import type { FC, InputHTMLAttributes } from 'react';

const Switch: FC<SwitchProps> = ({ className, name = 'switch', ...props }) => (
  <label className="flex items-center cursor-pointer">
    <input
      {...props}
      name={name}
      type="checkbox"
      className={['sr-only peer', className].filter(Boolean).join(' ')}
    />
    <div className="block relative bg-gray-950 w-10 h-6 p-1 rounded-full before:absolute before:bg-zinc-500 before:w-4 before:h-4 before:p-1 before:rounded-full before:transition-all before:duration-500 before:left-1 peer-checked:before:left-5 peer-checked:before:bg-white peer-disabled:bg-gray-700 peer-disabled:before:bg-gray-500 peer-disabled:cursor-not-allowed" />
  </label>
);

export default Switch;

interface SwitchProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {}
