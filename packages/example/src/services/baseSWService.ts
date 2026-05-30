import z from 'zod'
import type { itemSchema } from '@/components/chatLine'

const URL =
  process.env.NODE_ENV !== 'production'
    ? '/'
    : 'https://m1.apifoxmock.com/m1/6364923-6061111-default/'

export const requestSchema = z.object({
  broadcast: z.string(),
  message: z.string(),
  receipt: z.string(),
  scope: z.string(),
})

export const resultSchema = z.object({
  code: z.number(),
  data: z.object({
    date: z.iso.datetime().transform((str) => new Date(str)),
    id: z.number(),
    name: z.string(),
  }),
  message: z.string(),
  receivedBody: requestSchema.optional(),
})

export const sendMessage = (data: WorkerMessage) =>
  fetch(`${URL}api/health`, {
    headers: { 'Content-Type': 'application/json' },
    method: 'POST',
    body: JSON.stringify(data),
  })
    .then((res) => res.json())
    .then((res) => {
      const { data: result, error, success } = resultSchema.safeParse(res)
      return success
        ? {
            message: 'success',
            result,
          }
        : {
            message: error.issues.slice(-1)[0].message,
            result: null,
          }
    })

export const transmitResult = ({
  message,
  result,
  scope,
}: TransmitResultProps): z.infer<typeof itemSchema> => {
  const defaultDetail = {
    date: new Date(),
    message,
    own: false,
    user: scope,
    receipt: '',
  }

  try {
    const receipt = result?.receivedBody?.receipt
    return !result
      ? defaultDetail
      : {
          broadcast: result.receivedBody?.broadcast !== 'normal',
          date: result.data.date,
          message: JSON.stringify(result),
          own: result.receivedBody?.scope === scope,
          user: scope,
          receipt: receipt ?? '',
        }
  } catch {
    return { ...defaultDetail, message: 'JSON Parse Faild' }
  }
}

export type WorkerMessage = z.infer<typeof requestSchema>

type TransmitResultProps = Awaited<ReturnType<typeof sendMessage>> & { scope: string }
