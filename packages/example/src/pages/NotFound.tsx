import type { FC } from 'react';

const NotFound: FC = () => (
  <div className="min-h-160 flex flex-col items-center justify-center px-4">
    <h1 className="text-[12rem] font-bold text-primary/20 leading-none mb-4">404</h1>
    <h2 className="text-2xl md:text-3xl font-bold text-sky-400 mb-2">哎呀，页面走丢了</h2>
    <p className="text-neutral mb-8">
      你访问的页面不存在、已被删除或网址输入错误，请返回首页重新探索。
    </p>
  </div>
);

export default NotFound;
