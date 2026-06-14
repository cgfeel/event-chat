import type { FC } from 'react'
import { useNavigate } from 'react-router'
import Button from '@/components/Button'
import RedirectHandler from '@/components/RedirectHandler'

const NotFound: FC = () => {
  const navigate = useNavigate()
  return (
    <div className="flex min-h-160 flex-col items-center justify-center px-4">
      <RedirectHandler />
      <h1 className="text-primary/20 mb-4 text-[12rem] leading-none font-bold">404</h1>
      <h2 className="mb-2 text-2xl font-bold text-sky-400 md:text-3xl">哎呀，页面走丢了</h2>
      <p className="text-neutral mb-8">
        你访问的页面不存在、已被删除或网址输入错误，请返回首页重新探索。
      </p>
      <p>
        <Button
          size="md"
          variant="secondary"
          onClick={() => {
            navigate('/')?.catch(() => {})
          }}
        >
          返回首页
        </Button>
      </p>
    </div>
  )
}

export default NotFound
