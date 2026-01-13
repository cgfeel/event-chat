import { FormEmit, FormList, FormUpdate, FormUpdateFields } from '@/module/form';
import type { FC } from 'react';
import { isKey } from '@/utils/fields';

const formMap = Object.freeze({
  FormEmit,
  FormUpdate,
  FormUpdateFields,
  FormList,
});

const Form: FC<FormProps> = ({ name }) => {
  const FormCom = isKey(name, formMap) ? formMap[name] : formMap.FormEmit;
  return <FormCom />;
};

export default Form;

export interface FormProps {
  name?: keyof typeof formMap;
}
