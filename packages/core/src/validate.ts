import { ZodType, z } from 'zod';
import { EventDetailType, MountOpsType } from './utils';

const checkLiteral = <Detail, Name extends string = string, Schema extends ZodType = ZodType>(
  data: EventDetailType<Detail, Name>,
  { group, token }: MountOpsType<Name, Schema>
) => {
  const schema = z.object({
    group: group && !data.global ? z.literal(group) : z.undefined(),
    token: token ? z.literal(token) : z.undefined(),
  });

  const cause = schema.safeParse(data);
  return cause.success
    ? Promise.resolve(cause)
    : Promise.reject(new Error('validate faild', { cause }));
};

const checkDetail = <Name extends string = string, Schema extends ZodType = ZodType>(
  detail: unknown,
  { async, schema: schemaRaw }: MountOpsType<Name, Schema>
) => {
  const schema = schemaRaw ?? z.any();
  const result = async ? schema.safeParseAsync(detail) : Promise.resolve(schema.safeParse(detail));
  return result.then((cause) =>
    cause.success ? cause : Promise.reject(new Error('validate faild', { cause }))
  );
};

export const validate = <Detail, Name extends string = string, Schema extends ZodType = ZodType>(
  data: EventDetailType<Detail, Name>,
  record: MountOpsType<Name, Schema>
) =>
  checkLiteral(data, record).then(() =>
    checkDetail(data.detail, record).then((result) => ({
      ...data,
      detail: result.data,
    }))
  );
