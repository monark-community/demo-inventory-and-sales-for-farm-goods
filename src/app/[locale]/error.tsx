"use client"

import { usePathname } from "next/navigation"

import { Button } from "@/components/ui/button"
import { errorCopy } from "@/i18n/dictionaries/errors"

export default function ErrorBoundary({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const pathname = usePathname() ?? ""
  const copy = pathname.startsWith("/fr") ? errorCopy.fr : errorCopy.en
  return (
    <section role="alert" className="container-page flex flex-1 flex-col items-center justify-center py-20 text-center">
      <h1 className="text-3xl sm:text-4xl">{copy.title}</h1>
      <p className="mt-4 max-w-md text-muted-foreground">{copy.body}</p>
      <Button className="mt-8" size="lg" onClick={reset}>
        {copy.retry}
      </Button>
    </section>
  )
}
