import { FormEmit } from '@/module/form';
import type { FC } from 'react';
import { isKey } from '@/utils/fields';

const formMap = Object.freeze({
  FormEmit,
});

const Form: FC<FormProps> = ({ name }) => {
  const FormCom = isKey(name, formMap) ? formMap[name] : formMap.FormEmit;
  return <FormCom />;
};

export default Form;

interface FormProps {
  name?: keyof typeof formMap;
}
