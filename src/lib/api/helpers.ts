const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function parseId(params: { id: string }): string | null {
  const { id } = params;
  if (!id || !UUID_REGEX.test(id)) return null;
  return id;
}

export function calcBalanceDueDate(checkIn: string, balanceLeadDays: number): string {
  const date = new Date(checkIn);
  date.setDate(date.getDate() - balanceLeadDays);
  return date.toISOString().slice(0, 10);
}

export function calcDepositAmount(totalAmount: number, depositPercent: number): number {
  return Math.round((totalAmount * depositPercent) / 100);
}
