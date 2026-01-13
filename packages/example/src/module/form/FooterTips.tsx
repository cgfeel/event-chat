import { Divider } from 'antd';
import type { FC, PropsWithChildren, ReactNode } from 'react';

const FooterTips: FC<PropsWithChildren<FooterTipsProps>> = ({ children, title = '说明' }) => (
  <>
    <Divider orientation="left" plain>
      {title}
    </Divider>
    <div>{children}</div>
  </>
);

export default FooterTips;

interface FooterTipsProps {
  title?: ReactNode;
}
