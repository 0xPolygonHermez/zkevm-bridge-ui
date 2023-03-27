import { z } from "zod";

import { tokenParser } from "src/adapters/tokens";
import * as constants from "src/constants";
import { Chain, Currency, Env, PolicyCheck, Token } from "src/domain";
import { PendingTx, pendingTxParser, serializePendingTx } from "src/utils/serializers";

// Currency
export function getCurrency(): Currency {
  return getStorageByKey({
    defaultValue: constants.PREFERRED_CURRENCY,
    key: constants.PREFERRED_CURRENCY_KEY,
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
        envTokens.find(
          (token) => token.address === curr.address && token.chainId === curr.chainId
        ) === undefined
          ? [...acc, curr]
          : acc,
      []
    )
  );
}

export function getCustomTokens(): Token[] {
  return getStorageByKey({
    defaultValue: [],
    key: constants.CUSTOM_TOKENS_KEY,
    parser: z.array(tokenParser),
  });
}

export function getChainNativeCustomTokens(chain: Chain): Token[] {
  return getCustomTokens().filter((token) => token.chainId === chain.chainId);
}

export function isChainNativeCustomToken(token: Token, chain: Chain): boolean {
  return (
    getChainNativeCustomTokens(chain).find((tkn) => tkn.address === token.address) !== undefined
  );
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
  const isAlreadyAdded = customTokens.find(
    (tkn) => tkn.address === token.address && tkn.chainId === token.chainId
  );

  if (isAlreadyAdded) {
    return customTokens;
  } else {
    return setCustomTokens([token, ...customTokens]);
  }
}

export function removeCustomToken(token: Token): Token[] {
  return setCustomTokens(
    getCustomTokens().filter(
      (tkn) => !(tkn.address === token.address && tkn.chainId === token.chainId)
    )
  );
}

// Pending txs
export function getAccountPendingTxs(account: string, env: Env): PendingTx[] {
  const pendingTxs = getPendingTxs(env);
  return pendingTxs[account] || [];
}

function getPendingTxs(env: Env): Record<string, PendingTx[]> {
  return getStorageByKey({
    defaultValue: {},
    key: constants.PENDING_TXS_KEY,
    parser: z.record(z.array(z.unknown())).transform((unknownRecord) =>
      Object.entries(unknownRecord).reduce(
        (
          acc: Record<string, PendingTx[]>,
          [account, unknownList]: [string, unknown[]]
        ): Record<string, PendingTx[]> => ({
          ...acc,
          [account]: unknownList.reduce((accArray: PendingTx[], unknown: unknown): PendingTx[] => {
            const pendingTx = pendingTxParser(env).safeParse(unknown);
            return pendingTx.success ? [...accArray, pendingTx.data] : accArray;
          }, []),
        }),
        {}
      )
    ),
  });
}

function setPendingTxs(pendingTxs: Record<string, PendingTx[]>): Record<string, PendingTx[]> {
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

export function addAccountPendingTx(account: string, env: Env, pendingTx: PendingTx): PendingTx[] {
  const pendingTxs = getPendingTxs(env);
  const accountPendingTxs = getAccountPendingTxs(account, env);
  const newAccountPendingTxs = [...accountPendingTxs, pendingTx];

  setPendingTxs({
    ...pendingTxs,
    [account]: newAccountPendingTxs,
  });

  return newAccountPendingTxs;
}

export function removeAccountPendingTx(
  account: string,
  env: Env,
  depositTxHash: string
): PendingTx[] {
  const pendingTxs = getPendingTxs(env);
  const accountPendingTxs = getAccountPendingTxs(account, env);
  const newAccountPendingTxs = accountPendingTxs.filter((tx) => tx.depositTxHash !== depositTxHash);

  if (newAccountPendingTxs.length > 0) {
    setPendingTxs({
      ...pendingTxs,
      [account]: newAccountPendingTxs,
    });
  } else {
    setPendingTxs(
      Object.entries(pendingTxs).reduce(
        (acc: Record<string, PendingTx[]>, [key, value]: [string, PendingTx[]]) =>
          key === account ? acc : { ...acc, [key]: value },
        {}
      )
    );
  }

  return getAccountPendingTxs(account, env);
}

// PolicyCheck
export function getPolicyCheck(): PolicyCheck {
  return getStorageByKey({
    defaultValue: PolicyCheck.Unchecked,
    key: constants.POLICY_CHECK_KEY,
    parser: z.nativeEnum(PolicyCheck),
  });
}

export function setPolicyCheck(): PolicyCheck {
  return setStorageByKey({ key: constants.POLICY_CHECK_KEY, value: PolicyCheck.Checked });
}

// IsDepositWarningDismissed
export function getIsDepositWarningDismissed(): boolean {
  return getStorageByKey({
    defaultValue: false,
    key: constants.DISMISSED_DEPOSIT_WARNING_KEY,
    parser: z.boolean(),
  });
}

export function setIsDepositWarningDismissed(value: boolean): boolean {
  return setStorageByKey({ key: constants.DISMISSED_DEPOSIT_WARNING_KEY, value });
}

// Helpers
export function getStorageByKey<I, O>({
  defaultValue,
  key,
  parser,
}: {
  defaultValue: O;
  key: string;
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
