import { FooterTips, ListForm } from '@/module/form'
import {
  EscapePath,
  ExtendedAndRangePath,
  GroupAndReversePath,
  MatchPath,
  PointPath,
} from '@/module/namepath'
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
    <Card
      footer={
        <FooterTips>
          通过通配符 <Tag>*</Tag> 实现全局或局部匹配
        </FooterTips>
      }
      title="全局和局部匹配"
    >
      <MatchPath />
    </Card>
    <Card title="广播和反向匹配">
      <GroupAndReversePath />
    </Card>
    <Card title="扩展和范围路径">
      <ExtendedAndRangePath />
    </Card>
    <Card
      footer={
        <FooterTips>
          <Tag>formily</Tag>中转义符由<Tag>\\</Tag>组成，由于<Tag>\</Tag>
          本身是转义字符，示例中使用 <Tag>\\\\</Tag> 表示 <Tag>\\</Tag>
        </FooterTips>
      }
      title="转义路径"
    >
      <EscapePath />
    </Card>
  </div>
)

export default Namepath
