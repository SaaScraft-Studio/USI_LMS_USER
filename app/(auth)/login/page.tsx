'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Autoplay from 'embla-carousel-autoplay'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

import { apiRequest } from '@/lib/apiRequest'
import { useAuthStore } from '@/stores/authStore'

import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from '@/components/ui/carousel'
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form'
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input-otp'

/* -------------------------------------------------------------------------- */
/*                                   CONFIG                                   */
/* -------------------------------------------------------------------------- */
const OTP_EXPIRY = 120

const carouselItems = [
  { img: '/usiw.png', title: 'USI Webinars' },
  { img: '/slc.png', title: 'Smart Learning Courses' },
  { img: '/low.png', title: 'Live Operative Workshops' },
  { img: '/elp.png', title: 'e-Learning Program' },
  { img: '/login-speaker.png', title: 'Live Conferences' },
]

/* -------------------------------------------------------------------------- */
/*                                   SCHEMA                                   */
/* -------------------------------------------------------------------------- */
const LoginSchema = z.object({
  identifier: z
    .string()
    .min(3, 'Please enter Membership No / Email / Mobile'),
})

const OtpSchema = z.object({
  otp: z.string().length(6, 'OTP must be exactly 6 digits'),
})

type LoginValues = z.infer<typeof LoginSchema>
type OtpValues = z.infer<typeof OtpSchema>

/* -------------------------------------------------------------------------- */
/*                                  HELPERS                                   */
/* -------------------------------------------------------------------------- */
const buildLoginPayload = (identifier: string) => {
  if (/^\d{10}$/.test(identifier)) return { mobile: identifier }
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier))
    return { email: identifier }
  return { membershipNumber: identifier }
}

const formatTime = (s: number) =>
  `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`

/* -------------------------------------------------------------------------- */
/*                                  PAGE                                      */
/* -------------------------------------------------------------------------- */
export default function LoginPage() {
  const router = useRouter()
  const { setUser, hydrate } = useAuthStore()

  const [step, setStep] = useState<'LOGIN' | 'OTP'>('LOGIN')
  const [userId, setUserId] = useState<string | null>(null)
  const [otpTimer, setOtpTimer] = useState(OTP_EXPIRY)

  const [sendingOtp, setSendingOtp] = useState(false)
  const [verifyingOtp, setVerifyingOtp] = useState(false)

  const loginForm = useForm<LoginValues>({
    resolver: zodResolver(LoginSchema),
    defaultValues: { identifier: '' },
  })

  const otpForm = useForm<OtpValues>({
    resolver: zodResolver(OtpSchema),
    defaultValues: { otp: '' },
  })

  // helper function 
  const resetLoginFlow = () => {
    // reset async flags
    setSendingOtp(false)
    setVerifyingOtp(false)

    // clear OTP session
    setUserId(null)
    setOtpTimer(OTP_EXPIRY)

    // reset forms
    loginForm.reset({ identifier: '' })
    otpForm.reset()

    // go back to login step
    setStep('LOGIN')
  }


  /* ----------------------------- TIMER ----------------------------- */
  useEffect(() => {
    if (step !== 'OTP' || otpTimer <= 0) return
    const i = setInterval(() => setOtpTimer((t) => t - 1), 1000)
    return () => clearInterval(i)
  }, [step, otpTimer])

  /* ----------------------------- SEND OTP ----------------------------- */
  const sendOtp = async () => {
    if (sendingOtp) return

    const identifier = loginForm.getValues('identifier')
    const payload = buildLoginPayload(identifier)

    try {
      setSendingOtp(true)

      const res = await apiRequest<typeof payload, { userId: string }>({
        endpoint: '/api/users/login',
        method: 'POST',
        body: payload,
      })

      setUserId(res.userId)
      setStep('OTP')
      setOtpTimer(OTP_EXPIRY)
      otpForm.reset()

      toast.success('OTP sent successfully')
    } catch (e: any) {
      toast.error(e.message || 'Failed to send OTP')
      setSendingOtp(false)
    }
  }

  /* ----------------------------- VERIFY OTP ----------------------------- */
  const verifyOtp = async (values: OtpValues) => {
    if (!userId || verifyingOtp) return

    try {
      setVerifyingOtp(true)

      const res = await apiRequest<
        { userId: string; otp: string },
        { user: any }
      >({
        endpoint: '/api/users/verify-otp',
        method: 'POST',
        body: { userId, otp: values.otp },
      })

      setUser(res.user)
      await hydrate()

      toast.success('Login successful')
      router.replace('/upcoming')
    } catch (e: any) {
      otpForm.setError('otp', {
        message: e.message || 'Invalid or expired OTP',
      })
      setVerifyingOtp(false)
    }
  }

  /* -------------------------------------------------------------------------- */
  /*                                   UI                                       */
  /* -------------------------------------------------------------------------- */
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#d0ebff] to-[#a9d6fb]">
      {/* ================= HEADER ================= */}
      <header className="pt-6 sm:pt-8 flex flex-col items-center gap-6">
        <div className="flex items-center gap-4">
          <Image
            src="/urological.png"
            alt="Urological Society of India"
            width={80}
            height={80}
            className="h-9 sm:h-9 w-auto"
            priority
          />
          <p className="text-medium sm:text-xl font-semibold text-[#07288C] leading-tight">
            Urological Society <br /> of India
          </p>
          <Image
            src="/ISU_Logo.png"
            alt="Indian School of Urology"
            width={80}
            height={60}
            className="h-9 sm:h-9 w-auto"
            priority
          />
          <p className="text-medium sm:text-xl font-semibold text-[#07288C] leading-tight">
            Indian School <br /> of Urology
          </p>
        </div>

        {/* ================= CAROUSEL ================= */}
        <div className="w-full max-w-6xl px-4">
          <Carousel
            plugins={[
              Autoplay({
                delay: 3000,
                stopOnInteraction: false,
                stopOnMouseEnter: true,
              }),
            ]}
            opts={{ align: 'start', loop: true }}
            className="w-full"
          >
            <CarouselContent>
              {carouselItems.map((item, index) => (
                <CarouselItem
                  key={index}
                  className="basis-full md:basis-1/2 lg:basis-1/3"
                >
                  <Card className="bg-white/30 backdrop-blur-xl border border-white/30 shadow-lg rounded-2xl">
                    <CardContent className="flex flex-col items-center justify-center h-52 p-6">
                      <Image
                        src={item.img}
                        alt={item.title}
                        width={250}
                        height={150}
                        className="mb-4"
                      />
                      <p className="text-center font-semibold text-[#1F5C9E]">
                        {item.title}
                      </p>
                    </CardContent>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        </div>
      </header>

      {/* ================= LOGIN FORM ================= */}
      <main className="flex-1 flex items-center justify-center px-4 py-10">
        <Card className="p-0 w-full max-w-4xl overflow-hidden rounded-2xl shadow-xl grid md:grid-cols-[2fr_2fr]">
          {/* LEFT */}
          <div className="flex flex-col justify-between p-6 md:p-10">
            <div>
              <CardHeader className="px-0">
                <CardTitle className="text-2xl text-orange-700">
                  Login
                </CardTitle>
              </CardHeader>

              <CardContent className="px-0 space-y-4">
                {step === 'LOGIN' && (
                  <Form {...loginForm}>
                    <form
                      onSubmit={loginForm.handleSubmit(sendOtp)}
                      className="space-y-4"
                    >
                      <FormField
                        control={loginForm.control}
                        name="identifier"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Login using Membership Number / Email / Mobile
                            </FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="Membership Number / Email / Mobile"
                                disabled={sendingOtp}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button
                        className="w-full bg-orange-600 hover:bg-orange-700"
                        disabled={sendingOtp}
                      >
                        {sendingOtp && (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        Send OTP
                      </Button>
                    </form>
                  </Form>
                )}

                {step === 'OTP' && (
                  <>
                    <Form {...otpForm}>
                      <form
                        onSubmit={otpForm.handleSubmit(verifyOtp)}
                        className="space-y-4"
                      >
                        <FormField
                          control={otpForm.control}
                          name="otp"
                          render={({ field }) => (
                            <div className="flex justify-center w-full">
                              <InputOTP maxLength={6} {...field}>
                                <InputOTPGroup>
                                  {[0, 1, 2, 3, 4, 5].map((i) => (
                                    <InputOTPSlot key={i} index={i} />
                                  ))}
                                </InputOTPGroup>
                              </InputOTP>
                            </div>
                          )}
                        />
                        <FormMessage />

                        <Button
                          type="submit"
                          className="w-full bg-orange-600 hover:bg-orange-700"
                          disabled={verifyingOtp}
                        >
                          {verifyingOtp && (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          )}
                          Submit OTP & Login
                        </Button>
                      </form>
                    </Form>

                    <p className="text-xs text-center text-gray-500 flex justify-center gap-2">
                      {otpTimer > 0 ? (
                        <>Resend OTP in {formatTime(otpTimer)}</>
                      ) : (
                        <button
                          type="button"
                          onClick={sendOtp}
                          className="underline"
                        >
                          Resend OTP
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={resetLoginFlow}
                        className="underline text-orange-600"
                      >
                        Wrong Input ?
                      </button>

                    </p>
                  </>
                )}
              </CardContent>

              <CardFooter className="px-0 pt-4 text-sm text-center text-gray-500">
                Not a USI Member?
                <button
                  onClick={() => router.push('/signup')}
                  className="mx-1 text-orange-600 font-medium hover:underline"
                >
                  Signup
                </button>
                Subject to USI Approval
              </CardFooter>
            </div>

            {/* SPONSOR LOGO */}
            <div className="mt-6 text-center">
              <span className="text-sm text-gray-600 block mb-2">
                Educational Grant By
              </span>
              <Image
                src="/logo.png"
                alt="USI Logo"
                width={300}
                height={80}
                className="mx-auto"
              />
            </div>
          </div>

          {/* RIGHT IMAGE */}
          <div className="relative hidden md:block">
            <Image
              src="/login.png"
              alt="Login Illustration"
              fill
              priority
              className="object-cover"
            />
          </div>
        </Card>
      </main>

      {/* ================= FOOTER ================= */}
      <Card className="rounded-none border-t bg-white/20 backdrop-blur-xl">
        <CardContent className="py-4">
          <div className="flex items-center justify-center text-center px-4 text-xs sm:text-sm text-gray-600">
            © Urological Society of India. All Rights Reserved. Learning
            Management System by SaaScraft Studio (India) Pvt. Ltd.
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
