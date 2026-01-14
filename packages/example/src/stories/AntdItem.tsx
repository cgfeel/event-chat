import {
  FormEmit,
  FormList,
  FormRate,
  FormSchema,
  FormUpdate,
  FormUpdateFields,
} from '@/module/form';
import type { FC } from 'react';
import { isKey } from '@/utils/fields';

const formMap = Object.freeze({
  FormEmit,
  FormList,
  FormRate,
  FormSchema,
  FormUpdate,
  FormUpdateFields,
});

const Form: FC<FormProps> = ({ name }) => {
  const FormCom = isKey(name, formMap) ? formMap[name] : formMap.FormEmit;
  return <FormCom />;
};

export default Form;

export interface FormProps {
  name?: keyof typeof formMap;
}
