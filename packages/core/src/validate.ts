import { EventDetailType, MountOpsType, ResultType } from './utils';
import { z } from 'zod';

const checkLiteral: CheckFnType = (data, { group, token }) => {
  const schema = z.object({
    group: group && !data.global ? z.literal(group) : z.undefined(),
    token: token ? z.literal(token) : z.undefined(),
  });

  const cause = schema.safeParse(data);
  return cause.success
    ? Promise.resolve(cause)
    : Promise.reject(new Error('validate faild', { cause }));
};

const checkDetail: CheckFnType = ({ detail }, { async, schema: schemaRaw }) => {
  const schema = schemaRaw ?? z.any();
  const result = async ? schema.safeParseAsync(detail) : Promise.resolve(schema.safeParse(detail));
  return result.then((cause) =>
    cause.success ? cause : Promise.reject(new Error('validate faild', { cause }))
  );
};

export const validate: CheckFnType = (data, record) => {
  const result: Promise<ResultType> = Promise.resolve({ success: true, data });
  return [checkLiteral, checkDetail].reduce((_, checkFn) => checkFn(data, record), result);
};

type CheckFnType = <T extends EventDetailType>(
  data: T,
  options: MountOpsType
) => Promise<ResultType>;
