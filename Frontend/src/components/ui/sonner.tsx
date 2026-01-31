"use client"
/* eslint-disable react-refresh/only-export-components */
import { Toaster as Sonner, toast } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="dark"
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-card group-[.toaster]:text-card-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg group-[.toaster]:rounded-xl",
          title: "group-[.toast]:text-foreground group-[.toast]:font-semibold",
          description: "group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
          success:
            "group-[.toaster]:!bg-emerald-950/90 group-[.toaster]:!border-emerald-500/50 group-[.toaster]:!text-emerald-100",
          error:
            "group-[.toaster]:!bg-red-950/90 group-[.toaster]:!border-red-500/50 group-[.toaster]:!text-red-100",
          warning:
            "group-[.toaster]:!bg-amber-950/90 group-[.toaster]:!border-amber-500/50 group-[.toaster]:!text-amber-100",
          info:
            "group-[.toaster]:!bg-blue-950/90 group-[.toaster]:!border-blue-500/50 group-[.toaster]:!text-blue-100",
        },
      }}
      {...props}
    />
  )
}

// Helper functions para uso em todo o app
const showToast = {
  success: (message: string, description?: string) => {
    toast.success(message, { description })
  },
  error: (message: string, description?: string) => {
    toast.error(message, { description })
  },
  warning: (message: string, description?: string) => {
    toast.warning(message, { description })
  },
  info: (message: string, description?: string) => {
    toast.info(message, { description })
  },
  promise: <T,>(
    promise: Promise<T>,
    messages: {
      loading: string
      success: string
      error: string
    }
  ) => {
    return toast.promise(promise, messages)
  },
}

export { Toaster, showToast, toast }
