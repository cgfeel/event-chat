import { type FC } from 'react'
import Button from '@/components/Button'
import { routerPath } from '@/utils/fields'
import { broadcastAction, broadcastApi } from '../uitls'
import { panelStyles } from '../windowUitls'
import BroadcastItem, { BroadcastIframe } from './BroadcastItem'

const { panel, wrap } = panelStyles()
const itemList = [
  { scope: broadcastAction, title: 'main-broadast-action', iframe: false },
  { scope: broadcastAction, title: 'iframe-broadast-action', iframe: true },
] as const

const BroadcastChannelDemo: FC = () => {
  return (
    <div className={wrap({ class: 'h-108' })}>
      <div className={panel({ class: 'row-span-2 bg-transparent' })}>
        <div className="grid h-full w-full">
          <BroadcastItem
            scope={broadcastApi}
            title={
              <>
                broadast-api:{' '}
                <Button
                  onClick={() => {
                    const width = 800
                    const height = 600
                    const left = (screen.availWidth - width) / 2
                    const top = (screen.availHeight - height) / 2
                    window.open(
                      routerPath(`iframe?sub=${broadcastApi}`),
                      broadcastApi,
                      `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`
                    )
                  }}
                >
                  Open
                </Button>
              </>
            }
          />
        </div>
      </div>
      {itemList.map(({ iframe, scope, title }) =>
        iframe ? (
          <div className="min-h-54" key={`${scope}-${title}`}>
            <BroadcastIframe scope={scope} />
          </div>
        ) : (
          <BroadcastItem key={`${scope}-${title}`} scope={scope} title={title} />
        )
      )}
    </div>
  )
}

export default BroadcastChannelDemo
