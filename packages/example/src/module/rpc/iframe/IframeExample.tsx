import { type FC, type PropsWithChildren } from 'react'
import { tv } from 'tailwind-variants'
import { GroupProvider, iframeName } from '../uitls'
import SubIframe, { type SubIframeProps } from './SubIframe'

const styles = tv({
  base: 'h-full',
  variants: {
    sub: {
      true: 'grid grid-rows-2 gap-3',
    },
  },
})

const IframeExample: FC<PropsWithChildren<SubIframeProps>> = ({ children, group = iframeName }) => {
  const base = styles({ sub: Boolean(children) })
  return children ? (
    <GroupProvider.Provider value={{ group }}>
      <div className={base}>
        <div>
          <SubIframe group={group} />
        </div>
        {children && <div>{children}</div>}
      </div>
    </GroupProvider.Provider>
  ) : (
    <div className={base}>
      <SubIframe group={group} />
    </div>
  )
}

export default IframeExample
