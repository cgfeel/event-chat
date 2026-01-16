import { createToken, useEventChat } from '@event-chat/core';
import { type FC, memo, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import z from 'zod';
import { toastClose, toastItem as toastItemKey, toastOpen, toastOpenResult } from '@/utils/event';
import ToastItem from './ToastItem';
import { toastItem } from './utils';

const Toast: FC<{ group?: string }> = ({ group }) => {
  const [container, setContainer] = useState<HTMLDivElement | null>(null);
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
    group,
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
    group,
  });

  useEffect(() => {
    const { body } = document;
    const groupName = `toast-${group ?? 'global'}`;
    const warp = document.querySelector(`.${groupName}`) ? null : document.createElement('div');

    if (warp) {
      warp.className = groupName;
      setContainer(body.appendChild(warp));
    }
    return () => {
      if (warp) body.removeChild(warp);
    };
  }, [group, setContainer]);

  return !container
    ? null
    : createPortal(
        <div className="toast-container">
          {toasts.map((toast) => (
            <div key={toast.id} className="pointer-events-auto text-right">
              <ToastItem group={group} item={toast} />
            </div>
          ))}
        </div>,
        container
      );
};

export default memo(Toast, (pre, next) => pre.group === next.group);

interface ToastItemType extends z.infer<typeof toastItem> {}
