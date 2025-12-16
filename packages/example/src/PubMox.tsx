import { Button, useTest } from '@event-chat/core';
import type { FC } from 'react';
import { z } from 'zod';
import { useEventChat } from './hooks';

const Player = z.object({
  username: z.string(),
  xp: z.number(),
});

const PubMox: FC = () => {
  // 新增：打印 Button 类型和内容
  const [emit] = useEventChat('pub-mox', {
    /* eslint-disable no-console */
    callback: (detail) =>
      console.log('a----pub-mox', detail, Player.parse({ username: 'billie', xp: 100 })),
  });

  useTest();

  return (
    <span>
      <Button label="test" />
      <button type="button" onClick={() => emit({ name: 'sub-mox' })}>
        click it
      </button>
    </span>
  );
};

export default PubMox;
