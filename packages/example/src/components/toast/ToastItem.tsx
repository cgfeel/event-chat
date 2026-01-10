import { useEventChat } from '@event-chat/core';
import {
  faCheckCircle,
  faExclamationCircle,
  faInfoCircle,
  faTimes,
  faTimesCircle,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { type FC, type MouseEventHandler, useCallback, useEffect, useRef } from 'react';
import z from 'zod';
import { toastClose, toastItem as toastItemKey } from '@/utils/event';
import type { toastItem } from './utils';

const error = Object.freeze({
  bg: 'bg-toast-error',
  icon: faTimesCircle,
});

const info = Object.freeze({
  bg: 'bg-toast-info',
  icon: faInfoCircle,
});

const success = Object.freeze({
  bg: 'bg-toast-success',
  icon: faCheckCircle,
});

const warning = Object.freeze({
  bg: 'bg-toast-warning',
  icon: faExclamationCircle,
});

const toastConfig = Object.freeze({
  error,
  info,
  success,
  warning,
});

const ToastItem: FC<ToastItemProps> = ({ group, item }) => {
  const toastRef = useRef<HTMLDivElement>(null);
  const { id, message, title, type } = item;
  const config = toastConfig[type];

  const handleToastClick = useCallback(() => {
    const wrap = toastRef.current;
    if (wrap instanceof HTMLElement) {
      wrap.classList.remove('animate-toast-in');
      wrap.classList.add('animate-toast-out');
    }
  }, []);

  const handleClose: MouseEventHandler<HTMLSpanElement> = useCallback(
    (event) => {
      event.stopPropagation();
      handleToastClick();
    },
    [handleToastClick]
  );

  const { emit } = useEventChat(toastItemKey, {
    schema: z.string().refine((target) => target === id),
    callback: () => {
      handleToastClick();
    },
    group,
  });

  useEffect(() => {
    const wrap = toastRef.current;
    function animationEndHandle() {
      if (wrap?.classList.contains('animate-toast-out')) {
        emit({ detail: { id }, name: toastClose });
      }
    }
    if (wrap instanceof HTMLElement) {
      wrap.classList.add('animate-toast-in');
      wrap.addEventListener('animationend', animationEndHandle);
    }
    return () => {
      wrap?.removeEventListener('animationend', animationEndHandle);
    };
  }, [id, emit]);

  return (
    <div
      className={`toast-base ${config.bg}`}
      ref={toastRef}
      role="alert"
      onClick={handleToastClick}
    >
      <div className="toast-icon">
        <FontAwesomeIcon icon={config.icon} />
      </div>
      <div className="toast-content">
        <div className="font-bold">{title}</div>
        {message && <div className="text-opacity-90 text-xs mt-1">{message}</div>}
      </div>
      <span className="toast-close" onClick={handleClose}>
        <FontAwesomeIcon icon={faTimes} />
      </span>
    </div>
  );
};

export default ToastItem;

interface ToastItemProps {
  item: z.infer<typeof toastItem>;
  group?: string;
}
