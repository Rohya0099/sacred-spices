import type { Metadata } from "next";
import { Mail, MapPin, Phone } from "lucide-react";
import { PageShell } from "@/components/brand-shell";
import { publicCityState, publicSupportEmail, publicSupportPhone, publicWhatsAppNumber } from "@/lib/business-info";

export const metadata: Metadata = { title: "Contact" };

export default function ContactPage() {
  return (
    <PageShell>
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-saffron">Contact</p>
          <h1 className="mt-4 font-display text-5xl font-semibold text-ivory sm:text-6xl">We are here for your kitchen questions.</h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-ivory/70">
            Support replies within 24 hours during the early-access small-batch launch.
          </p>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {[
              { icon: Mail, label: "Email", value: publicSupportEmail() },
              { icon: Phone, label: "Phone", value: publicSupportPhone() },
              { icon: MapPin, label: "Location", value: publicCityState() }
            ].map((item) => (
              <article key={item.label} className="rounded-lg border border-turmeric/16 bg-charcoal p-6">
                <item.icon className="text-saffron" size={24} />
                <p className="mt-5 text-sm uppercase tracking-[0.22em] text-ivory/45">{item.label}</p>
                <p className="mt-2 font-semibold text-ivory">{item.value}</p>
              </article>
            ))}
          </div>
          <p className="mt-6 rounded-lg border border-turmeric/16 bg-charcoal p-4 text-sm leading-6 text-ivory/68">
            WhatsApp: {publicWhatsAppNumber()}
          </p>
        </div>
      </section>
    </PageShell>
  );
}
