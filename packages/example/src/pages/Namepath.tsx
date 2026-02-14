import { PointPath, SubscriptPath } from '@/module/namepath'
import { Tag } from 'antd'
import type { FC } from 'react'
import Card from '@/components/Card'

const Namepath: FC = () => (
  <div className="flex flex-col gap-16">
    <div>
      🚗 <Tag>namePath</Tag> 由 <Tag>@event-chat/core</Tag> 集成了 <Tag>@Formily/Path</Tag>
      ，为了便于演示这里使用 <Tag>@event-chat/antd-item</Tag> 做示范用例。
    </div>
    <Card title="点路径">
      <PointPath />
    </Card>
    <Card title="下标路径">
      <SubscriptPath />
    </Card>
  </div>
)

export default Namepath
