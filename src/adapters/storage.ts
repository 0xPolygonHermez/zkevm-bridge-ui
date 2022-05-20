import { z } from "zod";

import { StrictSchema } from "src/utils/type-safety";
import * as constants from "src/constants";
import { Currency, Token } from "src/domain";

// Currency

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

// Custom Tokens

const tokenParser = StrictSchema<Token>()(
  z.object({
    name: z.string(),
    symbol: z.string(),
    address: z.string(),
    decimals: z.number(),
    chainId: z.number(),
    logoURI: z.string(),
  })
);

const CUSTOM_TOKENS_KEY = "customTokens";

export function getCustomTokens(): Token[] {
  return getStorageByKey({
    key: CUSTOM_TOKENS_KEY,
    defaultValue: [],
    parser: z.array(tokenParser),
  });
}

export function setCustomTokens(tokens: Token[]): Token[] {
  return setStorageByKey({
    key: CUSTOM_TOKENS_KEY,
    value: tokens,
  });
}

export function addCustomToken(token: Token): Token[] {
  const customTokens = getCustomTokens();
  const isAlreadyAdded = customTokens.find((tkn) => tkn.address === token.address);
  if (isAlreadyAdded) {
    return customTokens;
  } else {
    return setCustomTokens([token, ...customTokens]);
  }
}

export function removeCustomToken(token: Token): Token[] {
  return setCustomTokens(getCustomTokens().filter((tkn) => tkn.address !== token.address));
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
    return setStorageByKey({ key, value: defaultValue });
  } else {
    const parsed = parser.safeParse(value);
    if (parsed.success) {
      return parsed.data;
    } else {
      try {
        const parsedJson = parser.safeParse(JSON.parse(value));
        if (parsedJson.success) {
          return parsedJson.data;
        } else {
          return setStorageByKey({ key, value: defaultValue });
        }
      } catch (_) {
        return setStorageByKey({ key, value: defaultValue });
      }
    }
  }
}

export function setStorageByKey<T>({ key, value }: { key: string; value: T }): T {
  const string = typeof value === "string" ? value : JSON.stringify(value);
  localStorage.setItem(key, string);
  return value;
}
