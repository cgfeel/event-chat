import { useEventChat } from '@event-chat/core';
import type { FC } from 'react';

const SubMox: FC = () => {
  const { emit } = useEventChat('sub-mox', {
    /* eslint-disable no-console */
    callback: (record) => console.log('a----sub-mox', record),
  });

  return (
    <button
      type="button"
      onClick={() => {
        emit({
          name: 'pub-mox',
          detail: {
            title: 'send to pub mox',
            ingredients: ['1', '2'],
          },
        });
      }}
    >
      click it
    </button>
  );
};

export default SubMox;
