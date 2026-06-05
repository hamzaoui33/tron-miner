import { Decimal } from '@prisma/client/runtime/library';

export function toNumber(value: Decimal | number | string): number {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') return parseFloat(value);
  return value.toNumber();
}

export function toDecimal(value: number | string): Decimal {
  return new Decimal(value);
}

export function formatTrx(value: Decimal | number | string, decimals = 4): string {
  return toNumber(value).toFixed(decimals);
}
