import { z } from 'zod'

const MAX_FILE_SIZE = 2 * 1024 * 1024 // 2 MB
const ACCEPTED_FILE_TYPES = ['application/pdf']

export const SignupSchema = z.object({
  prefix: z.string().min(1, 'Prefix is required.'),

  name: z.string().min(1, 'Full name is required.'),

  email: z
    .string()
    .min(1, 'Email is required.')
    .email('Please enter a valid email address.'),

  mobile: z
    .string()
    .min(1, 'Mobile number is required.')
    .regex(/^\d{10}$/, 'Mobile number must be exactly 10 digits.'),

  qualification: z.string().min(1, 'Qualification is required.'),

  affiliation: z.string().min(1, 'Affiliation is required.'),

  country: z.string().min(1, 'Country is required.'),

  uploadDocument: z
    .instanceof(File, { message: 'Document is required.' })
    .refine((file) => file.size <= MAX_FILE_SIZE, {
      message: 'PDF must be less than 2 MB.',
    })
    .refine((file) => ACCEPTED_FILE_TYPES.includes(file.type), {
      message: 'Only PDF files are allowed.',
    }),

  agree: z.literal(true, {
    message: 'Please accept Terms & Conditions.',
  }),
})

export type SignupValues = z.infer<typeof SignupSchema>
