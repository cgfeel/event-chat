import type { FormEventInstance } from '@event-chat/antd-item';
import BasicPrint from './BasicPrint';

const FormEvent = <Name extends string, Group extends string | undefined = undefined>(
  props: FormProps<Name, Group>
) => <BasicPrint {...props} />;

export default FormEvent;

export interface FormProps<Name extends string, Group extends string | undefined = undefined> {
  form?: FormEventInstance<Name, Group>;
  group?: Group;
  name?: Name;
}
