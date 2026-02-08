"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from 'sonner'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  AlertDialogFooter,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import {
  TechnicalSupportSchema,
  TechnicalSupportValues,
} from "@/validations/technicalSupport.schema";
import { apiRequest } from "@/lib/apiRequest";

/* ================= TYPES ================= */

type SupportSubmitResponse = {
  message: string;
  supportTicketNumber: string;
};

export function TechnicalSupportUI() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successData, setSuccessData] = useState<{
  ticketNumber: string;
} | null>(null);
const [copied, setCopied] = useState(false);

  const form = useForm<TechnicalSupportValues>({
    resolver: zodResolver(TechnicalSupportSchema),
    defaultValues: {
      name: "",
      email: "",
      message: "",
    },
  });

  /* ================= SUBMIT ================= */

  const onSubmit = async (values: TechnicalSupportValues) => {
  if (loading) return;
  setLoading(true);

  try {
    await apiRequest<
      TechnicalSupportValues,
      SupportSubmitResponse
    >({
      endpoint: "/api/support-message",
      method: "POST",
      body: values,
      showToast: false,
      onSuccess: (data) => {
        setOpen(false);
        form.reset();

        setSuccessData({
          ticketNumber: data.supportTicketNumber,
        });

        setTimeout(() => setSuccessData(null), 30000);
      },
    });
  } catch (error) {
  toast.error((error as Error).message)
  } finally {
    setLoading(false);
  }
};


  return (
    <>
      {/* Trigger */}
      <div className="text-center text-xs sm:text-sm mt-2">
        <AlertDialog open={open} onOpenChange={setOpen}>
          <AlertDialogTrigger asChild>
            <button className="text-gray-500 underline hover:text-gray-600 mb-12">
              Need technical support?
            </button>
          </AlertDialogTrigger>

          <AlertDialogContent
            className="max-w-3xl max-h-[80vh] overflow-y-auto overflow-x-hidden"
          >
            <AlertDialogHeader>
              <AlertDialogTitle>
                Technical Support
              </AlertDialogTitle>
            </AlertDialogHeader>

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Your Full Name *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter your full name"
                          {...field}
                        />
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
                      <FormLabel>
                        USI LMS Registered Email Address *
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter your usi lms registrerd email address"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Your Query Message (technical problem you are facing) *
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe your issue in detail"
                          rows={4}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <AlertDialogFooter>
                  <AlertDialogCancel type="button">
                    Close
                  </AlertDialogCancel>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="bg-orange-600 hover:bg-orange-700 text-white"
                  >
                    {loading ? "Submitting..." : "Submit"}
                  </Button>
                </AlertDialogFooter>
              </form>
            </Form>
          </AlertDialogContent>
        </AlertDialog>
      </div>

     {/* Success Message */}
{successData && (
  <div className="mb-6 flex justify-center animate-fadeIn">
    <div className="w-full max-w-md rounded-xl border border-orange-200 bg-gradient-to-br from-orange-50 to-white px-5 py-4 shadow-sm">

      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-orange-100 text-orange-600 text-lg font-semibold">
          ✓
        </div>

        {/* Content */}
        <div className="flex-1">
          <p className="text-sm font-semibold text-orange-800">
            Query Submitted Successfully
          </p>

          <p className="mt-1 text-sm text-orange-700">
            Our support team typically responds within{" "}
            <span className="font-medium">24 hours</span>.
          </p>

          {/* Ticket Number */}
          <div className="mt-3 flex items-center justify-between gap-3 rounded-lg bg-orange-100/60 px-3 py-2">
            <div className="text-sm text-orange-800">
              <span className="font-medium">Ticket Number:</span>{" "}
              <span className="font-mono">
                {successData.ticketNumber}
              </span>
            </div>

            <button
              onClick={() => {
                navigator.clipboard.writeText(
                  successData.ticketNumber
                );
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
              className="rounded-md bg-white px-2 py-1 text-xs font-medium text-orange-700 shadow-sm transition hover:bg-orange-50"
            >
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
)}


    </>
  );
}
