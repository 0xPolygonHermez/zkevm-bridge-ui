import { z } from "zod";

import * as constants from "src/constants";
import { Currencies } from "src/domain";

export function getCurrency(): Currencies {
  return getStorageByKey(
    constants.PREFERRED_CURRENCY_KEY,
    constants.PREFERRED_CURRENCY,
    z.nativeEnum(Currencies)
  );
}

export function setCurrency(currency: Currencies): void {
  setStorageByKey(constants.PREFERRED_CURRENCY_KEY, currency);
}

export function getStorageVersion(): number {
  return getStorageByKey(constants.STORAGE_VERSION_KEY, constants.STORAGE_VERSION, z.number());
}

// Helpers

type Value = string | number | boolean | Record<string, unknown> | Array<unknown>;

export function getStorageByKey<T extends Value>(
  key: string,
  defaultValue: T,
  parser: z.ZodSchema<T>
): T {
  const string = localStorage.getItem(key);
  if (string === null) {
    setStorageByKey(key, defaultValue);
    return defaultValue;
  } else {
    try {
      const value: unknown = JSON.parse(string);
      const parsed = parser.safeParse(value);
      return parsed.success ? parsed.data : defaultValue;
    } catch (_) {
      return string as T;
    }
  }
}

export function setStorageByKey(key: string, value: Value): void {
  const string = typeof value === "string" ? value : JSON.stringify(value);
  localStorage.setItem(key, string);
}
