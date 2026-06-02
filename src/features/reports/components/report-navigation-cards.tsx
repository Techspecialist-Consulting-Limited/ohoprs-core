"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

const cards = [
  {
    title: "Organization Reports",
    description: "Rank organizations by delivery scale, program count, and completion performance.",
    href: "/reports/organizations",
  },
  {
    title: "Program Reports",
    description: "Track program performance, enrolled beneficiaries, and distribution outcomes.",
    href: "/reports/programs",
  },
  {
    title: "Beneficiary Reports",
    description: "Review state coverage, verification quality, and beneficiary operational health.",
    href: "/reports/beneficiaries",
  },
  {
    title: "Distribution Reports",
    description: "See delivery performance together with bulk-processing metrics from Phase 10.",
    href: "/reports/distributions",
  },
];

export function ReportNavigationCards() {
  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <Link key={card.href} href={card.href} className="rounded-[28px] border border-border bg-surface p-5 shadow-sm">
          <p className="text-lg font-semibold text-foreground">{card.title}</p>
          <p className="mt-2 text-sm leading-6 text-muted">{card.description}</p>
          <div className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-accent">
            Open report
            <ArrowRight size={16} />
          </div>
        </Link>
      ))}
    </section>
  );
}
