import type { FC, InputHTMLAttributes } from 'react';

const Switch: FC<SwitchProps> = ({ className, name = 'switch', ...props }) => (
  <label className="flex cursor-pointer items-center">
    <input
      {...props}
      className={['peer sr-only', className].filter(Boolean).join(' ')}
      name={name}
      type="checkbox"
    />
    <div className="relative block h-6 w-10 rounded-full bg-gray-950 p-1 peer-checked:bg-sky-600 peer-disabled:cursor-not-allowed peer-disabled:bg-gray-700 before:absolute before:left-1 before:h-4 before:w-4 before:rounded-full before:bg-zinc-500 before:p-1 before:shadow-xl before:transition-all before:duration-300 peer-checked:before:left-5 peer-checked:before:bg-white peer-disabled:before:bg-gray-500" />
  </label>
);

export default Switch;

interface SwitchProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {}
