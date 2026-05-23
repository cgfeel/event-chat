import { RPCProvider } from '@event-chat/rpc/react'
import { ConfigProvider, theme } from 'antd'
import { type FC, type PropsWithChildren, useRef } from 'react'
import { StoreContext, createRecipientsStore } from './createRecipientsStore'

const RecipientsProvider: FC<PropsWithChildren> = ({ children }) => {
  const storeRef = useRef(createRecipientsStore())
  return (
    <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm,
      }}
    >
      <RPCProvider>
        <StoreContext.Provider value={storeRef.current}>{children}</StoreContext.Provider>
      </RPCProvider>
    </ConfigProvider>
  )
}

export default RecipientsProvider
