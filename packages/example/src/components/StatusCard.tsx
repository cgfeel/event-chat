import { type FC, useMemo } from 'react';
import { cn, tv } from 'tailwind-variants';
import { isKey } from '@/utils/fields';

const card = tv({
  base: 'flex w-full max-w-md items-center gap-3 rounded-lg p-4 shadow-md',
  variants: {
    status: {
      default: 'border border-gray-200 bg-gray-50',
      failed: 'border border-red-200 bg-red-50',
      success: 'border border-green-200 bg-green-50',
      waiting: 'border border-blue-200 bg-blue-50',
    },
  },
  defaultVariants: {
    status: 'default',
  },
});

const icon = tv({
  base: 'flex h-8 w-8 items-center justify-center rounded-full',
  variants: {
    status: {
      default: 'bg-gray-100 text-gray-600',
      failed: 'bg-red-100 text-red-600',
      success: 'bg-green-100 text-green-600',
      waiting: 'bg-blue-100 text-blue-600',
    },
  },
  defaultVariants: {
    status: 'default',
  },
});

const colorMap = Object.freeze({
  default: 'text-gray-700',
  failed: 'text-red-700',
  success: 'text-green-700',
  waiting: 'text-blue-700',
});

const iconMap = Object.freeze({
  default: <span className="text-lg font-bold">…</span>,
  failed: <span className="text-lg font-bold">×</span>,
  success: <span className="text-lg font-bold">✓</span>,
  waiting: <span className="text-lg font-bold">○</span>,
});

const StatusCard: FC<StatusCardProps> = ({ code, text, status = 'default' }) => {
  const color = useMemo(
    () => (isKey(status, colorMap) ? colorMap[status] : colorMap.default),
    [status]
  );

  const IconCom = useMemo(
    () => (isKey(status, iconMap) ? iconMap[status] : iconMap.default),
    [status]
  );

  return (
    <div className={card({ status })}>
      <div className={icon({ status })}>{IconCom}</div>
      <div className="flex-1">
        <div className={color}>状态码: {code ?? '--'}</div>
        <p className={cn('text-base', color)}>{text}</p>
      </div>
    </div>
  );
};

export default StatusCard;

export interface StatusCardProps {
  code?: 100 | 200 | 300 | 400 | 500;
  status?: keyof typeof iconMap;
  text?: string;
}

// const codeMap = [100, 200, 300, 400, 500] as const

// const numberEnum = <Num extends number, T extends Readonly<Num[]>>(
//   args: T
// ): z.ZodSchema<T[number]> => {
//   return z.custom<T[number]>((val: any) => args.includes(val));
// };

// export const rateObject = z.object({
//     code: numberEnum(codeMap).optional(),
//     status: z.enum(objectKeys(iconMap)).optional(),
//     text: z.string()
// })
