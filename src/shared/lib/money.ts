import Decimal from "decimal.js";

Decimal.set({ rounding: Decimal.ROUND_HALF_UP });

export const fmtUAH = (s: string) =>
  new Intl.NumberFormat("uk-UA", {
    style: "currency",
    currency: "UAH",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(new Decimal(s).toNumber());

export const mulMoney = (price: string, qty: number) => new Decimal(price).mul(qty).toFixed(2);

export const sumMoney = (values: string[]) =>
  values.reduce((acc, v) => new Decimal(acc).plus(v), new Decimal(0)).toFixed(2);
