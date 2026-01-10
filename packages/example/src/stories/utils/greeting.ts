import z from 'zod';
import { toastItem } from '@/components/toast/utils';

export const schema = toastItem.omit({ id: true }).partial().required({ title: true }).extend({
  keyname: z.string().optional(),
});

export function getGreeting(name: string) {
  return `Hello, ${name}!`;
}
