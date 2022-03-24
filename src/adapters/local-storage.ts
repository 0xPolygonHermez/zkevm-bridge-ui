import { z } from "zod";

import * as constants from "src/constants";
import { Currency } from "src/domain";

export function getCurrency(): Currency {
  return getStorageByKey({
    key: constants.PREFERRED_CURRENCY_KEY,
    defaultValue: constants.PREFERRED_CURRENCY,
    parser: z.nativeEnum(Currency),
  });
}

export function setCurrency(currency: Currency): void {
  setStorageByKey({ key: constants.PREFERRED_CURRENCY_KEY, value: currency });
}

// Helpers
export function getStorageByKey<T>({
  key,
  defaultValue,
  parser,
}: {
  key: string;
  defaultValue: T;
  parser: z.ZodSchema<T>;
}): T {
  const value = localStorage.getItem(key);
  if (value === null) {
    setStorageByKey({ key, value: defaultValue });
    return defaultValue;
  } else {
    const parsed = parser.safeParse(value);
    return parsed.success ? parsed.data : defaultValue;
  }
}

export function setStorageByKey({ key, value }: { key: string; value: unknown }): void {
  const string = typeof value === "string" ? value : JSON.stringify(value);
  localStorage.setItem(key, string);
}
