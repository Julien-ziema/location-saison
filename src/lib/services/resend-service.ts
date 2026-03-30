import { Resend } from "resend";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SendBalanceLinkParams {
  guestEmail: string;
  guestName: string;
  propertyName: string;
  balanceAmount: number;
  paymentUrl: string;
  checkIn: string;
}

// ─── Singleton ────────────────────────────────────────────────────────────────

function getResend(): Resend {
  const key = process.env.RESEND_API_KEY;
  if (!key || key === "re_TODO") {
    throw new Error("RESEND_API_KEY non configurée");
  }
  return new Resend(key);
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatEuros(centimes: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(centimes / 100);
}

// ─── Fonctions ────────────────────────────────────────────────────────────────

async function sendBalanceLink(params: SendBalanceLinkParams): Promise<void> {
  const {
    guestEmail,
    guestName,
    propertyName,
    balanceAmount,
    paymentUrl,
    checkIn,
  } = params;

  let resend: Resend;

  try {
    resend = getResend();
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (message.includes("RESEND_API_KEY non configurée")) {
      console.warn("[RESEND] Email non envoyé (clé non configurée)");
      return;
    }
    throw err;
  }

  const formattedAmount = formatEuros(balanceAmount);

  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
      <h2 style="color: #1a1a1a;">Bonjour ${guestName},</h2>

      <p>Le solde de votre séjour à <strong>${propertyName}</strong> est désormais dû.</p>

      <table style="border-collapse: collapse; width: 100%; margin: 16px 0;">
        <tr>
          <td style="padding: 8px 0; color: #555;">Bien :</td>
          <td style="padding: 8px 0; font-weight: bold;">${propertyName}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #555;">Date d'arrivée :</td>
          <td style="padding: 8px 0; font-weight: bold;">${checkIn}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #555;">Montant du solde :</td>
          <td style="padding: 8px 0; font-weight: bold; color: #2563eb;">${formattedAmount}</td>
        </tr>
      </table>

      <a
        href="${paymentUrl}"
        style="
          display: inline-block;
          background-color: #2563eb;
          color: #ffffff;
          padding: 12px 24px;
          border-radius: 6px;
          text-decoration: none;
          font-weight: bold;
          margin: 16px 0;
        "
      >
        Payer le solde — ${formattedAmount}
      </a>

      <p style="color: #666; font-size: 14px; margin-top: 24px;">
        Si vous avez des questions, n'hésitez pas à nous contacter.
      </p>

      <p style="color: #999; font-size: 12px; border-top: 1px solid #eee; padding-top: 16px; margin-top: 24px;">
        LocaFlow — Gestion simplifiée de vos locations saisonnières
      </p>
    </div>
  `;

  const { error } = await resend.emails.send({
    from: "LocaFlow <noreply@locaflow.app>",
    to: guestEmail,
    subject: `Solde à régler — ${propertyName}`,
    html,
  });

  if (error) {
    throw new Error(`Resend — envoi échoué : ${error.message}`);
  }
}

// ─── Export ───────────────────────────────────────────────────────────────────

export const resendService = {
  sendBalanceLink,
};
