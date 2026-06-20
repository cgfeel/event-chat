import type { FC, PropsWithChildren } from 'react'

const Alert: FC<PropsWithChildren> = ({ children }) => (
  <div className="flex flex-col gap-2 rounded-md border border-blue-300 bg-blue-50 px-4 py-2">
    {children}
  </div>
)

export default Alert
