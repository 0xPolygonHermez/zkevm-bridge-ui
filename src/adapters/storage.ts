import { z } from "zod";

import * as constants from "src/constants";
import { Currency, Token, Chain, Env } from "src/domain";
import { tokenParser } from "src/adapters/tokens";
import {
  PendingTx,
  SerializedPendingTx,
  serializedPendingTxParser,
  serializePendingTx,
  deserializePendingTx,
} from "src/utils/serializers";

// Currency
export function getCurrency(): Currency {
  return getStorageByKey({
    key: constants.PREFERRED_CURRENCY_KEY,
    defaultValue: constants.PREFERRED_CURRENCY,
    parser: z.nativeEnum(Currency),
  });
}

export function setCurrency(currency: Currency): Currency {
  return setStorageByKey({ key: constants.PREFERRED_CURRENCY_KEY, value: currency });
}

// Custom Tokens
export function cleanupCustomTokens(envTokens: Token[]): Token[] {
  return setCustomTokens(
    getCustomTokens().reduce(
      (acc: Token[], curr: Token) =>
        envTokens.find((token) => token.address === curr.address) === undefined
          ? [...acc, curr]
          : acc,
      []
    )
  );
}

export function getCustomTokens(): Token[] {
  return getStorageByKey({
    key: constants.CUSTOM_TOKENS_KEY,
    defaultValue: [],
    parser: z.array(tokenParser),
  });
}

export function getChainCustomTokens(chain: Chain): Token[] {
  return getCustomTokens().filter(
    (token) =>
      token.chainId === chain.chainId ||
      (token.wrappedToken && token.wrappedToken.chainId === chain.chainId)
  );
}

export function isChainCustomToken(token: Token, chain: Chain): boolean {
  return getChainCustomTokens(chain).find((tkn) => tkn.address === token.address) !== undefined;
}

export function setCustomTokens(tokens: Token[]): Token[] {
  return setStorageByKey({
    key: constants.CUSTOM_TOKENS_KEY,
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

// Pending txs
function getSerializedPendingTxs(): SerializedPendingTx[] {
  return getStorageByKey({
    key: constants.PENDING_TXS_KEY,
    defaultValue: [],
    parser: z.array(serializedPendingTxParser),
  });
}

function setSerializedPendingTxs(
  serializedPendingTxs: SerializedPendingTx[]
): SerializedPendingTx[] {
  return setStorageByKey({
    key: constants.PENDING_TXS_KEY,
    value: serializedPendingTxs,
  });
}

export function getPendingTxs(env: Env): PendingTx[] {
  const serializedPendingTxs = getStorageByKey({
    key: constants.PENDING_TXS_KEY,
    defaultValue: [],
    parser: z.array(serializedPendingTxParser),
  });

  return serializedPendingTxs.map((tx) => deserializePendingTx(tx, env));
}

export function setPendingTxs(pendingTxs: PendingTx[]): PendingTx[] {
  setStorageByKey({
    key: constants.PENDING_TXS_KEY,
    value: pendingTxs.map(serializePendingTx),
  });

  return pendingTxs;
}

export function addPendingTx(pendingTx: PendingTx): void {
  const serializedPendingTxs = getSerializedPendingTxs();
  const serializedPendingTx = serializePendingTx(pendingTx);

  setSerializedPendingTxs([...serializedPendingTxs, serializedPendingTx]);
}

export function removePendingTx(depositTxHash: string): void {
  const serializedPendingTxs = getSerializedPendingTxs();
  const updatedSerializedPendingTxs = serializedPendingTxs.filter(
    (tx) => tx.depositTxHash !== depositTxHash
  );

  setSerializedPendingTxs(updatedSerializedPendingTxs);
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
