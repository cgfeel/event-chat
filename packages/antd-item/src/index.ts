import FormEventInner from './FormEvent';
import FormItem from './FormItem';
import FormList from './FormList';
import { AntdCom, FormBaseInstance, useForm, useFormInstance } from './utils';

const observer = (FormCom: FormBaseInstance): void => {
  AntdCom.form = FormCom;
};

const FormEvent: typeof FormEventInner & FormExtraInstance = Object.assign(FormEventInner, {
  Item: FormItem,
  List: FormList,
  observer,
  useForm,
  useFormInstance,
});

export * from './utils';
export default FormEvent;

interface FormExtraInstance {
  Item: typeof FormItem;
  List: typeof FormList;
  observer: typeof observer;
  useForm: typeof useForm;
  useFormInstance: typeof useFormInstance;
}
