import z from 'zod'

const videoSchema = z.custom<HTMLVideoElement>((val) => val instanceof HTMLVideoElement, {
  error: 'Target type must be HTMLDivElement.',
})

export const itemSchema = z.object({
  date: z.date(),
  message: z.string(),
  receipt: z.string(),
  user: z.string(),
  audio: z.string().optional(),
  broadcast: z.boolean().optional(),
  busy: z.boolean().optional(),
  card: z.number().optional(),
  img: z.string().optional(),
  own: z.boolean().optional(),
  video: videoSchema.optional(),
})

export const messageSchema = z.object({
  ...itemSchema.pick({
    date: true,
    message: true,
    receipt: true,
  }).shape,
  name: z.string(),
  status: z.enum(['broadcast', 'busy', 'normal']),
  recipient: z.string().optional(),
})

export type SendMessage = z.infer<typeof messageSchema>
