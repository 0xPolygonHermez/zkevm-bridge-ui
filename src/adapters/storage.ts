import { z } from "zod";

import * as constants from "src/constants";
import { tokenParser } from "src/adapters/tokens";
import { PendingTx, pendingTxParser, serializePendingTx } from "src/utils/serializers";
import { Currency, Token, Chain, Env } from "src/domain";

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
export function getAccountPendingTxs(account: string, env: Env): PendingTx[] {
  const pendingTxs = getPendingTxs(env);
  return pendingTxs[account] || [];
}

function getPendingTxs(env: Env): Record<string, PendingTx[]> {
  return getStorageByKey({
    key: constants.PENDING_TXS_KEY,
    defaultValue: {},
    parser: z.record(z.array(z.unknown())).transform((unknownRecord) =>
      Object.entries(unknownRecord).reduce(
        (
          acc: Record<string, PendingTx[]>,
          [account, unknownList]: [string, unknown[]]
        ): Record<string, PendingTx[]> => {
          const pendings = unknownList.reduce(
            (accArray: PendingTx[], unknown: unknown): PendingTx[] => {
              const pendingTx = pendingTxParser(env).safeParse(unknown);
              return pendingTx.success ? [...accArray, pendingTx.data] : accArray;
            },
            []
          );
          const pendingTxs: Record<string, PendingTx[]> = {
            ...acc,
            [account]: pendings,
          };
          return pendingTxs;
        },
        {}
      )
    ),
  });
}

export function setPendingTxs(
  pendingTxs: Record<string, PendingTx[]>
): Record<string, PendingTx[]> {
  setStorageByKey({
    key: constants.PENDING_TXS_KEY,
    value: Object.entries(pendingTxs).reduce(
      (acc, [key, value]) => ({
        ...acc,
        [key]: value.map(serializePendingTx),
      }),
      {}
    ),
  });

  return pendingTxs;
}

export function addPendingTx(account: string, env: Env, pendingTx: PendingTx): PendingTx[] {
  const pendingTxs = getPendingTxs(env);
  const pendings: PendingTx[] = pendingTxs[account] || [];
  const newStorage: Record<string, PendingTx[]> = {
    ...pendingTxs,
    [account]: [...pendings, pendingTx],
  };
  setPendingTxs(newStorage);
  return getAccountPendingTxs(account, env);
}

export function removePendingTx(account: string, env: Env, depositTxHash: string): PendingTx[] {
  const pendingTxs = getPendingTxs(env);
  const pendings: PendingTx[] = pendingTxs[account] || [];
  const newPendings = pendings.filter((tx) => tx.depositTxHash !== depositTxHash);
  if (newPendings.length > 0) {
    setPendingTxs({
      ...pendingTxs,
      [account]: newPendings,
    });
  } else {
    setPendingTxs(pendingTxs);
  }

  return getAccountPendingTxs(account, env);
}

// Helpers
export function getStorageByKey<I, O>({
  key,
  defaultValue,
  parser,
}: {
  key: string;
  defaultValue: O;
  parser: z.ZodSchema<O, z.ZodTypeDef, I>;
}): O {
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
