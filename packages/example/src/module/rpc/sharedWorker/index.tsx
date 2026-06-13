import { type FC } from 'react'
import WorkerLogs from '../WorkerLogs'
import { sharedGroup, sharedWorkerAction, sharedWorkerApi } from '../uitls'
import { panelStyles } from '../windowUitls'
import SharedWorkerItem, { SharedWorkerIframe } from './SharedWorkerItem'

const { panel, wrap } = panelStyles()
const itemList = [
  { scope: sharedWorkerAction, iframe: false },
  { scope: sharedWorkerAction, iframe: true },
  { scope: sharedWorkerApi, iframe: false },
] as const

const SharedWorkerDemo: FC = () => (
  <div className={wrap()}>
    <div className={panel()}>
      <WorkerLogs group={sharedGroup} />
    </div>
    {itemList.map(({ iframe, scope }) =>
      iframe ? (
        <SharedWorkerIframe key={scope} scope={scope} />
      ) : (
        <SharedWorkerItem key={scope} scope={scope} />
      )
    )}
  </div>
)

export default SharedWorkerDemo
