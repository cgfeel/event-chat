import { createToken, useEventChat } from '@event-chat/core';
import { type FC, type PropsWithChildren, memo, useState } from 'react';
import z from 'zod';
import { toastClose, toastItem as toastItemKey, toastOpen, toastOpenResult } from '@/utils/event';
import ToastItem from './ToastItem';
import { toastItem } from './utils';

const Toast: FC<PropsWithChildren> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItemType[]>([]);
  const { emit } = useEventChat(toastOpen, {
    schema: toastItem.omit({ id: true }).partial().required({ title: true }).extend({
      keyname: z.string().optional(),
    }),
    callback: ({ detail }) => {
      const { keyname, duration = 3000, type = 'info', ...args } = detail;
      const id = createToken('toast');

      setToasts((current) => current.concat({ ...args, duration, id, type }));
      if (duration > 0) {
        setTimeout(() => {
          emit({ detail: id, name: toastItemKey });
        }, duration);
      }
      emit({
        detail: { id, keyname },
        name: toastOpenResult,
      });
    },
  });

  useEventChat(toastClose, {
    schema: z.object({
      id: z.string(),
    }),
    callback: ({ detail }) =>
      setToasts((current) => {
        const update = current.filter((item) => item.id !== detail.id);
        return update.length === current.length ? current : update;
      }),
  });

  return (
    <>
      {children}
      <div className="toast-container">
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto text-right">
            <ToastItem item={toast} />
          </div>
        ))}
      </div>
    </>
  );
};

export default memo(Toast, () => true);

interface ToastItemType extends z.infer<typeof toastItem> {}
