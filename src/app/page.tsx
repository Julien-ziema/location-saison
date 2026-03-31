import Link from "next/link";
import {
  CreditCard,
  ShieldCheck,
  CalendarClock,
  LayoutDashboard,
  ArrowRight,
} from "lucide-react";

const features = [
  {
    icon: CreditCard,
    title: "Acompte automatique",
    description:
      "Envoyez un lien de paiement Stripe en un clic. Le locataire paie, vous etes notifie.",
  },
  {
    icon: ShieldCheck,
    title: "Caution securisee",
    description:
      "Empreinte bancaire par pre-autorisation. Le montant est bloque sans etre debite.",
  },
  {
    icon: CalendarClock,
    title: "Solde programme",
    description:
      "Le solde est envoye automatiquement avant l'arrivee. Plus de relances manuelles.",
  },
  {
    icon: LayoutDashboard,
    title: "Tableau de bord",
    description:
      "Suivez tous vos biens, reservations et paiements depuis une interface unique.",
  },
];

const steps = [
  {
    number: "1",
    title: "Ajoutez vos biens",
    description: "Enregistrez vos locations avec leurs tarifs et conditions.",
  },
  {
    number: "2",
    title: "Creez une reservation",
    description:
      "Renseignez les dates, le locataire et le montant. LocaFlow calcule le reste.",
  },
  {
    number: "3",
    title: "Les paiements s'enchainent",
    description:
      "Acompte, caution, solde : chaque etape se declenche automatiquement.",
  },
];

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 md:px-12">
        <span className="font-heading text-2xl text-blue-600">LocaFlow</span>
        <Link
          href="/auth/signin"
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
        >
          Connexion
        </Link>
      </header>

      {/* Hero */}
      <section className="flex flex-col items-center gap-6 px-6 py-20 text-center md:py-32">
        <h1 className="font-heading max-w-3xl text-4xl text-slate-800 md:text-6xl">
          Automatisez les paiements de vos locations saisonnieres
        </h1>
        <p className="max-w-xl text-lg text-slate-500">
          Acompte, caution, solde : LocaFlow gere le cycle de paiement complet
          de vos reservations. Vous gerez vos biens, on gere les encaissements.
        </p>
        <Link
          href="/auth/signin"
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-base font-medium text-white transition-colors hover:bg-blue-700"
        >
          Commencer gratuitement
          <ArrowRight className="h-4 w-4" />
        </Link>
      </section>

      {/* Features */}
      <section className="bg-white px-6 py-20 md:px-12">
        <h2 className="font-heading mb-12 text-center text-3xl text-slate-800">
          Tout ce qu'il vous faut
        </h2>
        <div className="mx-auto grid max-w-5xl gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="rounded-xl border border-slate-200 bg-slate-50 p-6"
            >
              <feature.icon className="mb-4 h-8 w-8 text-blue-600" />
              <h3 className="mb-2 text-lg font-semibold text-slate-800">
                {feature.title}
              </h3>
              <p className="text-sm leading-relaxed text-slate-500">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="px-6 py-20 md:px-12">
        <h2 className="font-heading mb-12 text-center text-3xl text-slate-800">
          Comment ca marche
        </h2>
        <div className="mx-auto grid max-w-4xl gap-10 md:grid-cols-3">
          {steps.map((step) => (
            <div key={step.number} className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-xl font-bold text-white">
                {step.number}
              </div>
              <h3 className="mb-2 text-lg font-semibold text-slate-800">
                {step.title}
              </h3>
              <p className="text-sm leading-relaxed text-slate-500">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA final */}
      <section className="flex flex-col items-center gap-6 bg-blue-600 px-6 py-20 text-center">
        <h2 className="font-heading max-w-xl text-3xl text-white md:text-4xl">
          Pret a automatiser vos locations ?
        </h2>
        <p className="max-w-md text-blue-100">
          Creez votre compte en quelques secondes et commencez a encaisser sans
          effort.
        </p>
        <Link
          href="/auth/signin"
          className="inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 text-base font-medium text-blue-600 transition-colors hover:bg-blue-50"
        >
          Commencer gratuitement
          <ArrowRight className="h-4 w-4" />
        </Link>
      </section>

      {/* Footer */}
      <footer className="flex items-center justify-center px-6 py-8 text-sm text-slate-400">
        <p>LocaFlow &mdash; &copy; 2026. Tous droits reserves.</p>
      </footer>
    </div>
  );
}
