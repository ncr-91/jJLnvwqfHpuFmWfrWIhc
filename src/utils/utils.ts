import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

interface TrendResult {
  trend: "increment" | "decrement" | "no change";
  percentage: number;
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const calculateTrendPercentage = (
  countOfThisMonth: number,
  countOfLastMonth: number
): TrendResult => {
  if (countOfLastMonth === 0) {
    return countOfThisMonth === 0
      ? { trend: "no change", percentage: 0 }
      : { trend: "increment", percentage: 100 };
  }

  const change = countOfThisMonth - countOfLastMonth;
  const percentage = Math.abs((change / countOfLastMonth) * 100);

  if (change > 0) {
    return { trend: "increment", percentage };
  } else if (change < 0) {
    return { trend: "decrement", percentage };
  } else {
    return { trend: "no change", percentage: 0 };
  }
};

export const formatValue = (value: number) =>
  Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "AUD",
    currencyDisplay: "narrowSymbol",
    maximumSignificantDigits: 3,
    notation: "compact",
  }).format(value);

export const formatThousands = (value: number) =>
  Intl.NumberFormat("en-US", {
    maximumSignificantDigits: 3,
    notation: "compact",
  }).format(value);

export const formatCurrency = (value: number) => {
  if (Math.abs(value) >= 1000000) {
    return Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "AUD",
      maximumSignificantDigits: 3,
      notation: "compact",
    }).format(value);
  }
  return Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "AUD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};
