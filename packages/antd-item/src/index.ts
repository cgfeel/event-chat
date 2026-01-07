import FormEventInner from './FormEvent';
import { AntdCom, FormBaseInstance } from './utils';

const observer = (FormCom: FormBaseInstance): void => {
  AntdCom.form = FormCom;
};

const FormEvent: typeof FormEventInner & { observer: typeof observer } = Object.assign(
  FormEventInner,
  {
    observer,
  }
);

export { FormEvent };
export { default as FormItem } from './FormItem';
export { default as FormList } from './FormList';
export * from './utils';
