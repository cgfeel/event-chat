import type { FC } from 'react';
import ExtraGuid from '@/components/ExtraGuid';

const SubSchemaExtra: FC = () => (
  <ExtraGuid title="只接受以下类型的 JSON：">
    <pre>{`{
  ingredients: string[]; 
  title: string; 
  description?: string
}`}</pre>
    <div className="pb-1 pt-4">例如：</div>
    <pre>{`{ 
  "ingredients": ["番茄 2 个", "鸡蛋 3 个", "挂面 100g", "食盐 适量", "食用油 少许"], 
  "title": "番茄鸡蛋面",
  "description": "经典家常面食，做法简单快捷，口感鲜香浓郁。番茄的酸甜搭配鸡蛋的嫩滑，裹在劲道的挂面上，是一道老少皆宜的美味主食。"
}`}</pre>
    <div className="pb-1 pt-4">也可以传一个错误的数据试试</div>
  </ExtraGuid>
);

export default SubSchemaExtra;
