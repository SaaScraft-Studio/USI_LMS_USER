'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { toast } from 'sonner'

import { SignupSchema, SignupValues } from '@/validations/signupSchema'
import { useFormDraftStore } from '@/stores/useFormDraftStore'
import {
  zodResolver,
  useForm,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/lib/imports'

import { apiRequest } from '@/lib/apiRequest'
import { getIndianFormattedDate } from '@/lib/formatIndianDate'
import { countries } from '@/data/countries'

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'

/* ================= IP COUNTRY DETECTION ================= */

async function detectCountry(): Promise<string | null> {
  try {
    const res = await fetch('https://ipapi.co/json/')
    const data = await res.json()
    return data?.country_name || null
  } catch {
    return null
  }
}

export default function SignupForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  /* ================= Draft Store ================= */

  const DRAFT_KEY = 'signup-form'
  const { drafts, setDraft, clearDraft } = useFormDraftStore()
  const signupDraft = drafts[DRAFT_KEY]

  /* ================= Form ================= */

  const form = useForm<SignupValues>({
    resolver: zodResolver(SignupSchema),
    defaultValues: signupDraft || {
      prefix: '',
      name: '',
      email: '',
      mobile: '',
      qualification: '',
      affiliation: '',
      country: '',
      uploadDocument: undefined,
      agree: false,
    },
  })

  /* ================= Draft Persistence ================= */

  useEffect(() => {
    const subscription = form.watch((values) => {
      setDraft(DRAFT_KEY, values)
    })
    return () => subscription.unsubscribe()
  }, [form])

  /* ================= Auto-Fill Country ================= */

  useEffect(() => {
    if (form.getValues('country')) return

    detectCountry().then((country) => {
      if (country) {
        form.setValue('country', country, {
          shouldDirty: true,
        })
      }
    })
  }, [])

  /* ================= Submit ================= */

  async function onSubmit(values: SignupValues) {
    try {
      setLoading(true)

      const formData = new FormData()
      formData.append('prefix', values.prefix || '')
      formData.append('name', values.name)
      formData.append('email', values.email)
      formData.append('mobile', values.mobile)
      formData.append('qualification', values.qualification || '')
      formData.append('affiliation', values.affiliation || '')
      formData.append('country', values.country)
      formData.append('uploadDocument', values.uploadDocument)

      await apiRequest({
        endpoint: '/api/users/register',
        method: 'POST',
        body: formData,
      })

      toast.success('Signup Successful 🎉 Wait for Admin Approval', {
        description: `Submitted on ${getIndianFormattedDate()}`,
      })

      clearDraft(DRAFT_KEY)
      form.reset()

      setTimeout(() => router.push('/login'), 1000)
    } catch (err: any) {
      toast.error(err.message || 'Signup failed ❌')
    } finally {
      setLoading(false)
    }
  }

  /* ================= UI (UNCHANGED) ================= */

  return (
    <Card className="p-0 w-full max-w-4xl overflow-hidden rounded-2xl shadow-xl grid md:grid-cols-[2fr_2fr]">
      {/* ================= LEFT – FORM ================= */}
      <div className="flex flex-col justify-between p-6 md:p-10">
        <div>
          <CardHeader className="px-0">
            <CardTitle className="text-2xl text-center text-orange-700">
              Sign Up Form
            </CardTitle>
          </CardHeader>

          <CardContent className="px-0">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-3"
              >
                <FormField
                  control={form.control}
                  name="prefix"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prefix *</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Dr / Prof / Mr / Ms" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />


                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name *</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Enter full name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />


                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address *</FormLabel>
                      <FormControl>
                        <Input {...field} type="email" placeholder="Enter email" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />


                <FormField
                  control={form.control}
                  name="mobile"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mobile Number *</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="10-digit mobile number"
                          inputMode="numeric"
                          maxLength={10}
                          onInput={(e) => {
                            e.currentTarget.value = e.currentTarget.value
                              .replace(/\D/g, '')
                              .slice(0, 10)
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="qualification"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Qualification *</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Enter qualification" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />


                <FormField
                  control={form.control}
                  name="affiliation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Affiliation *</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Enter affiliation" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />


                <FormField
                  control={form.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Country *</FormLabel>
                      <FormControl>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger className="w-full p-3">
                            <SelectValue placeholder="Select country" />
                          </SelectTrigger>
                          <SelectContent>
                            {countries.map((c) => (
                              <SelectItem key={c.value} value={c.value}>
                                {c.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />


                <FormField
                  control={form.control}
                  name="uploadDocument"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Please attach a copy of proof of residency in urology / urology degree (pdf only) *</FormLabel>
                      <FormControl>
                        <Input
                          type="file"
                          accept=".pdf"
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            field.onChange(file)
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />


                <FormField
                  control={form.control}
                  name="agree"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div className="flex items-start gap-2 text-sm pt-2">
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                          <span>
                            I agree to{' '}
                            <Link
                              href="/signup/term-and-condition"
                              className="text-orange-600 font-medium hover:underline"
                            >
                              Terms & Conditions
                            </Link>
                          </span>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />


                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-orange-600 hover:bg-orange-700"
                >
                  {loading ? 'Signing up...' : 'Sign Up'}
                </Button>

                <p className="text-xs text-center pt-2">
                  Already have an account?{' '}
                  <span
                    onClick={() => router.push('/login')}
                    className="text-orange-600 cursor-pointer"
                  >
                    Login
                  </span>
                </p>
              </form>
            </Form>
          </CardContent>
        </div>

        {/* LOGO */}
        <div className="mt-6 flex flex-col items-center text-center gap-2">
          <span className="text-sm text-gray-600">
            Educational Grant By
          </span>
          <Image
            src="/logo.png"
            alt="USI Logo"
            width={300}
            height={80}
            className="w-full max-w-[300px] object-contain"
            priority
          />
        </div>
      </div>

      {/* ================= RIGHT – IMAGE (UNCHANGED) ================= */}
      <div className="relative hidden md:block">
        <Image
          src="/login.png"
          alt="Signup Illustration"
          fill
          priority
          className="object-fit"
        />
      </div>
    </Card>
  )
}
