/** Keeps amounts inside JavaScript's safe integer range while typing. */
const MAX_DIGITS = 12;

/** `300000` becomes `300.000` */
export function groupThousands(amount: number): string {
  return String(Math.round(Math.abs(amount))).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

/** `300000` becomes `Rp300.000` */
export function formatRupiah(amount: number): string {
  return `${amount < 0 ? '-' : ''}Rp${groupThousands(amount)}`;
}

/** Reads the digits out of any user input, so `Rp300.000` and `300000` both work. */
export function parseRupiah(text: string): number {
  const digits = text.replace(/\D/g, '').slice(0, MAX_DIGITS);
  return digits === '' ? 0 : Number(digits);
}
