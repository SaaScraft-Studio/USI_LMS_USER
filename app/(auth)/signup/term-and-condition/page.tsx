'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

export default function TermsAndConditionsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1200)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center px-4 py-8">
      <div className="w-full max-w-3xl bg-white rounded-lg shadow-sm p-6 flex flex-col">

        {/* Back Button */}
        <button
          onClick={() => router.push('/signup')}
          className="flex items-center text-sm text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Signup
        </button>

        {/* Content */}
        <div className="flex-1">
          {loading ? <Skeleton /> : <TermsContent router={router} />}
        </div>

        {/* Footer */}
        {!loading && (
          <p className="text-xs text-gray-500 pt-6 border-t text-center mt-10">
            © {new Date().getFullYear()} Urological Society of India
          </p>
        )}
      </div>
    </div>
  )
}

/* ---------------- Skeleton Loader ---------------- */

function Skeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-6 bg-gray-200 rounded w-2/3" />
      <div className="h-4 bg-gray-200 rounded w-full" />
      <div className="h-4 bg-gray-200 rounded w-11/12" />
      <div className="h-4 bg-gray-200 rounded w-10/12" />
      <div className="h-4 bg-gray-200 rounded w-9/12" />
    </div>
  )
}

/* ---------------- Terms Content ---------------- */

function TermsContent({ router }: { router: ReturnType<typeof useRouter> }) {
  return (
    <div className="space-y-6">

      <h1 className="text-2xl font-semibold text-gray-900">
        Terms & Conditions
      </h1>

      <p className="text-sm text-gray-600">
        Welcome to the Urological Society of India (USI) Learning Management
        System (LMS). By accessing or using this platform, you agree to comply
        with the following terms and conditions.
      </p>

      <section>
        <h2 className="font-medium text-gray-800 mb-2">
          1. Eligibility & Access
        </h2>
        <p className="text-sm text-gray-600">
          Access to the USI LMS is restricted to registered members, trainees,
          and authorized users approved by the Urological Society of India.
          USI reserves the right to approve, suspend, or revoke access at its
          discretion.
        </p>
      </section>

      <section>
        <h2 className="font-medium text-gray-800 mb-2">
          2. Educational Purpose
        </h2>
        <p className="text-sm text-gray-600">
          All content provided on this platform is intended solely for
          educational and professional development purposes and should not
          replace independent clinical judgment.
        </p>
      </section>

      <section>
        <h2 className="font-medium text-gray-800 mb-2">
          3. Intellectual Property
        </h2>
        <p className="text-sm text-gray-600">
          All materials including videos, documents, and assessments are the
          intellectual property of USI or its contributors. Unauthorized
          reproduction, redistribution, or commercial use is prohibited.
        </p>
      </section>

      <section>
        <h2 className="font-medium text-gray-800 mb-2">
          4. User Responsibilities
        </h2>
        <p className="text-sm text-gray-600">
          Users are responsible for maintaining the confidentiality of their
          account credentials and for all activities conducted under their
          account.
        </p>
      </section>

      <section>
        <h2 className="font-medium text-gray-800 mb-2">
          5. Limitation of Liability
        </h2>
        <p className="text-sm text-gray-600">
          The Urological Society of India shall not be liable for any direct or
          indirect damages resulting from the use of this platform or reliance
          on its content.
        </p>
      </section>

      <section>
        <h2 className="font-medium text-gray-800 mb-2">
          6. Amendments
        </h2>
        <p className="text-sm text-gray-600">
          USI reserves the right to modify these terms at any time. Continued
          use of the LMS constitutes acceptance of the updated terms.
        </p>
      </section>

      {/* Accept Button - Centered & directly after content */}
      <div className="pt-8 flex justify-center">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button className="bg-orange-600 hover:bg-orange-700 px-6">
              I Accept Terms & Conditions
            </Button>
          </AlertDialogTrigger>

          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                Confirm Acceptance
              </AlertDialogTitle>
              <AlertDialogDescription>
                By confirming, you acknowledge that you have read and agree to
                the Terms & Conditions of the Urological Society of India
                Learning Management System.
              </AlertDialogDescription>
            </AlertDialogHeader>

            <AlertDialogFooter>
              <AlertDialogCancel>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={() => router.push('/signup')}
                className="bg-orange-600 hover:bg-orange-700"
              >
                Confirm
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )
}
