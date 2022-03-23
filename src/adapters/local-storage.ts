import { z } from "zod";

import * as constants from "src/constants";
import { Currency } from "src/domain";

export function getCurrency(): Currency {
  return getStorageByKey(
    constants.PREFERRED_CURRENCY_KEY,
    constants.PREFERRED_CURRENCY,
    z.nativeEnum(Currency)
  );
}

export function setCurrency(currency: Currency): void {
  setStorageByKey(constants.PREFERRED_CURRENCY_KEY, currency);
}

export function getStorageVersion(): number {
  return getStorageByKey(constants.STORAGE_VERSION_KEY, constants.STORAGE_VERSION, z.number());
}

// Helpers
export function getStorageByKey<T>(key: string, defaultValue: T, parser: z.ZodSchema<T>): T {
  const value = localStorage.getItem(key);
  if (value === null) {
    setStorageByKey(key, defaultValue);
    return defaultValue;
  } else {
    const parsed = parser.safeParse(value);
    return parsed.success ? parsed.data : defaultValue;
  }
}

export function setStorageByKey(key: string, value: unknown): void {
  const string = typeof value === "string" ? value : JSON.stringify(value);
  localStorage.setItem(key, string);
}
