import React from "react";
import { CheckCircle, XCircle } from "lucide-react";
import { auth } from "@/lib/auth";
import { PageHeader } from "@/components/shared/PageHeader";

function IntegrationStatus({ configured }: { configured: boolean }) {
  return configured ? (
    <span className="inline-flex items-center gap-1.5 text-sm text-emerald-600">
      <CheckCircle className="h-4 w-4" />
      Configuré
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 text-sm text-slate-400">
      <XCircle className="h-4 w-4" />
      Non configuré
    </span>
  );
}

export default async function SettingsPage() {
  const session = await auth();

  const isStripeConfigured =
    Boolean(process.env.STRIPE_SECRET_KEY) &&
    process.env.STRIPE_SECRET_KEY !== "sk_test_TODO";

  const isResendConfigured =
    Boolean(process.env.RESEND_API_KEY) &&
    process.env.RESEND_API_KEY !== "re_TODO";

  const isLocal = process.env.NODE_ENV === "development";

  return (
    <div className="space-y-6">
      <PageHeader title="Paramètres" />

      <div className="max-w-2xl space-y-6">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-slate-800">Compte</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-600">Email</span>
              <span className="font-mono text-sm text-slate-700">
                {session?.user?.email ?? "—"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-600">Nom</span>
              <span className="text-sm text-slate-700">
                {session?.user?.name ?? "—"}
              </span>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-slate-800">Intégrations</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-700">Stripe</p>
                <p className="text-xs text-slate-400">
                  Paiements par carte (acompte, caution, solde)
                </p>
              </div>
              <IntegrationStatus configured={isStripeConfigured} />
            </div>
            <div className="h-px bg-slate-100" />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-700">Resend</p>
                <p className="text-xs text-slate-400">
                  Envoi d&apos;emails transactionnels
                </p>
              </div>
              <IntegrationStatus configured={isResendConfigured} />
            </div>
          </div>
        </div>

        {isLocal && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 shadow-sm">
            <h2 className="mb-2 text-base font-semibold text-amber-800">Compte de test</h2>
            <p className="text-sm text-amber-700">
              En développement local, utilisez le compte de test&nbsp;:
            </p>
            <div className="mt-2 space-y-1">
              <p className="font-mono text-sm text-amber-800">
                Email&nbsp;: test@locaflow.dev
              </p>
              <p className="font-mono text-sm text-amber-800">
                Mot de passe&nbsp;: password
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
