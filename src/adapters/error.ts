import { z, ZodError } from "zod";
import * as platform from "platform";
import * as StackTrace from "stacktrace-js";

import { StrictSchema } from "src/utils/type-safety";
import { REPORT_ERROR_FORM_ENTRIES, REPORT_ERROR_FORM_URL } from "src/constants";

interface MessageKeyError {
  message: string;
}

const messageKeyErrorParser = StrictSchema<MessageKeyError>()(
  z.object({
    message: z.string(),
  })
);

export interface JsonRpcError {
  code: number;
  message: string;
  data: {
    code: number;
    message: string;
  };
}

export const jsonRpcError = StrictSchema<JsonRpcError>()(
  z.object({
    code: z.number(),
    message: z.string(),
    data: z.object({
      code: z.number(),
      message: z.string(),
    }),
  })
);

export interface MetaMaskUserRejectedRequestError {
  code: 4001;
  message: string;
}

export const metaMaskUserRejectedRequestError = StrictSchema<MetaMaskUserRejectedRequestError>()(
  z.object({
    code: z.literal(4001),
    message: z.string(),
  })
);

export interface MetaMaskResourceUnavailableError {
  code: -32002;
  message: string;
}

export const metaMaskResourceUnavailableError = StrictSchema<MetaMaskResourceUnavailableError>()(
  z.object({
    code: z.literal(-32002),
    message: z.string(),
  })
);

export interface EthersInsufficientFundsError {
  code: "INSUFFICIENT_FUNDS";
  reason: string;
}

export const ethersInsufficientFundsError = StrictSchema<EthersInsufficientFundsError>()(
  z.object({
    code: z.literal("INSUFFICIENT_FUNDS"),
    reason: z.string(),
  })
);

export interface MetaMaskUnknownChainError {
  code: 4902;
  message: string;
}

export const metaMaskUnknownChainError = StrictSchema<MetaMaskUnknownChainError>()(
  z.object({
    code: z.literal(4902),
    message: z.string(),
  })
);

export enum ProviderError {
  Ethereum = "ethereum",
  PolygonZkEVM = "polygon-zkevm",
}

export const providerError = StrictSchema<ProviderError>()(z.nativeEnum(ProviderError));

function sanitizeErrorMessage(errorMessage: string): string {
  try {
    return JSON.stringify(JSON.parse(errorMessage));
  } catch (error) {
    const selectMultipleTabsAndSpaces = /[^\S\r\n]{2,}/g;
    return errorMessage.replaceAll(selectMultipleTabsAndSpaces, " ");
  }
}

export function parseError(error: unknown): Promise<string> {
  console.error(error);
  const unknownError = Promise.resolve(`An unknown error has occurred: ${JSON.stringify(error)}`);
  if (typeof error === "string") {
    return Promise.resolve(error);
  } else if (error instanceof Error) {
    const maxErrorLength = 4096;
    return StackTrace.fromError(error)
      .then((stackframes) =>
        [
          sanitizeErrorMessage(error.message),
          ">>>>>>>>>> Stringification >>>>>>>>>>",
          JSON.stringify(error),
          ">>>>>>>>>> Stack >>>>>>>>>>",
          ...stackframes.map((sf) => sf.toString()),
        ]
          .join("\n")
          .substring(0, maxErrorLength)
      )
      .catch((e) => {
        console.error(e);
        return unknownError;
      });
  } else {
    const parsedJsonRpcError = jsonRpcError.safeParse(error);
    const parsedMessageKeyError = messageKeyErrorParser.safeParse(error);
    if (parsedJsonRpcError.success) {
      return Promise.resolve(
        `${parsedJsonRpcError.data.message} (code ${parsedJsonRpcError.data.code}): ${parsedJsonRpcError.data.data.message} (code ${parsedJsonRpcError.data.data.code})`
      );
    } else if (parsedMessageKeyError.success) {
      return Promise.resolve(parsedMessageKeyError.data.message);
    } else {
      return unknownError;
    }
  }
}

export function logDecodingError<T>(error: ZodError<T>, details: string): void {
  error.errors.forEach((issue) => {
    switch (issue.code) {
      case "invalid_union": {
        issue.unionErrors.forEach((e) => logDecodingError(e, details));
        break;
      }
      default: {
        console.error(`A decoding error occurred: ${details}`);
        console.error(JSON.stringify(issue, null, 4));
        break;
      }
    }
  });
}

/**
 * Report an error using the report issue form
 */
export function reportError(error: string): void {
  // ToDo: Add network data
  const data = {
    [REPORT_ERROR_FORM_ENTRIES.url]: window.location.href,
    [REPORT_ERROR_FORM_ENTRIES.error]: error,
    [REPORT_ERROR_FORM_ENTRIES.platform]: platform.toString(),
  };
  const params = new URLSearchParams(data).toString();
  window.open(`${REPORT_ERROR_FORM_URL}?${params}`, "_blank");
}
