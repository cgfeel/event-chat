import { FooterTips, ListForm } from '@/module/form'
import { PointPath } from '@/module/namepath'
import { Tag } from 'antd'
import type { FC } from 'react'
import Card from '@/components/Card'

const Namepath: FC = () => (
  <div className="flex flex-col gap-16">
    <div>
      🚗 <Tag>namePath</Tag> 由 <Tag>@event-chat/core</Tag> 集成了 <Tag>@Formily/Path</Tag>
      ，为了便于演示这里使用 <Tag>@event-chat/antd-item</Tag> 做示范用例。
    </div>
    <Card
      footer={
        <FooterTips>
          接受 <Tag>formily</Tag> 和 <Tag>antd</Tag> 两种路径方式
        </FooterTips>
      }
      title="点路径"
    >
      <PointPath />
    </Card>
    <Card
      footer={<FooterTips>允许下标路径，同时允许通过相对路径的方式动态修改值</FooterTips>}
      title="下标路径"
    >
      <div className="max-w-150">
        <ListForm />
      </div>
    </Card>
  </div>
)

export default Namepath
