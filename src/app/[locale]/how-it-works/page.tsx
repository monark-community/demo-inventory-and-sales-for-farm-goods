import { ArrowRight, Check, Sprout, Store } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"

import { ContractDiagram } from "@/components/diagrams/contract-diagram"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { href, isLocale } from "@/i18n/config"
import { getDictionary } from "@/i18n"
import { pageMetadata } from "@/lib/metadata"
import { photos } from "@/lib/photos"

export async function generateMetadata({ params }: PageProps<"/[locale]/how-it-works">) {
  const { locale } = await params
  if (!isLocale(locale)) return {}
  const d = getDictionary(locale).how
  return pageMetadata(locale, "/how-it-works", d.metaTitle, d.metaDescription)
}

function Steps({ title, icon, steps }: { title: string; icon: React.ReactNode; steps: { title: string; body: string }[] }) {
  return (
    <div className="rounded-lg border bg-card p-5 sm:p-6">
      <h2 className="flex items-center gap-2 text-2xl">
        {icon}
        {title}
      </h2>
      <ol className="mt-5 space-y-5">
        {steps.map((s, i) => (
          <li key={s.title} className="flex gap-4">
            <span
              aria-hidden="true"
              className="flex size-9 shrink-0 items-center justify-center rounded-full border-2 border-primary font-display text-lg font-bold text-primary"
            >
              {i + 1}
            </span>
            <p>
              <strong className="font-semibold">{s.title}</strong> <span className="text-muted-foreground">{s.body}</span>
            </p>
          </li>
        ))}
      </ol>
    </div>
  )
}

export default async function HowItWorksPage({ params }: PageProps<"/[locale]/how-it-works">) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const dict = getDictionary(locale)
  const h = dict.how
  const closing = dict.home.closing.title

  return (
    <>
      <section className="container-page grid gap-10 pt-10 pb-14 md:grid-cols-[1.2fr_0.8fr] md:items-center md:pt-16">
        <div>
          <h1 className="text-4xl sm:text-5xl">{h.title}</h1>
          <p className="mt-5 max-w-2xl text-lg text-muted-foreground">{h.intro}</p>
        </div>
        <div className="relative mx-auto aspect-[4/5] w-full max-w-xs overflow-hidden rounded-lg border shadow-crate md:max-w-sm">
          <Image src={photos.openStand.src} alt={h.imageAlt} fill priority sizes="(min-width: 768px) 30vw, 80vw" className="object-cover" />
        </div>
      </section>

      <section className="container-page grid gap-6 pb-16 md:grid-cols-2">
        <Steps title={h.standTitle} icon={<Store className="size-6 text-primary" aria-hidden="true" />} steps={h.standSteps} />
        <Steps title={h.farmTitle} icon={<Sprout className="size-6 text-primary" aria-hidden="true" />} steps={h.farmSteps} />
      </section>

      <section className="border-y bg-card">
        <div className="container-page py-16 md:py-20">
          <h2 className="max-w-2xl text-3xl sm:text-4xl">{h.contract.title}</h2>
          <div className="mt-10 rounded-lg border bg-background p-4 sm:p-6">
            <ContractDiagram d={h.contract.diagram} />
          </div>
        </div>
      </section>

      <section className="container-page grid gap-10 py-16 md:grid-cols-[0.9fr_1.1fr] md:py-20">
        <div>
          <h2 className="text-3xl sm:text-4xl">{h.kit.title}</h2>
          <ul className="mt-6 space-y-3">
            {h.kit.items.map((k) => (
              <li key={k} className="flex gap-3">
                <Check className="mt-1 size-5 shrink-0 text-success" aria-hidden="true" />
                <span>{k}</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="text-3xl sm:text-4xl">{h.faqTitle}</h2>
          <Accordion type="single" collapsible className="mt-4">
            {h.faq.map((f, i) => (
              <AccordionItem key={f.q} value={`q${i}`}>
                <AccordionTrigger className="text-left text-base font-semibold">{f.q}</AccordionTrigger>
                <AccordionContent className="text-base text-muted-foreground">{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      <section className="bg-primary text-primary-foreground">
        <div className="container-page flex flex-col items-start gap-5 py-14 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-3xl">{closing}</h2>
          <Button asChild size="lg" variant="accent">
            <Link href={href(locale, "/app/stand/trois-erables")}>
              {h.cta}
              <ArrowRight aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </section>
    </>
  )
}
