import { ListForm as ListFormRaw } from '@/module/form'
import {
  EscapePath,
  ExtendedAndRangePath,
  GroupAndReversePath,
  MatchPath,
  PointPath,
} from '@/module/namepath'
import type { FC } from 'react'

const ListForm: FC = () => (
  <div className="max-w-150">
    <ListFormRaw />
  </div>
)

const demoMap = Object.freeze({
  EscapePath,
  ExtendedAndRangePath,
  GroupAndReversePath,
  ListForm,
  MatchPath,
  PointPath,
})

const NamePath: FC<NamePathProps> = ({ name }) => {
  const Component = demoMap[name]
  return <Component />
}

export default NamePath

export interface NamePathProps {
  /* 演示类型 */
  name: keyof typeof demoMap
}
