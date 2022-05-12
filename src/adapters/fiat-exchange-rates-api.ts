import { z } from "zod";
import axios from "axios";

import { Currency, FiatExchangeRates } from "src/domain";
import { StrictSchema } from "src/utils/type-safety";

interface GetFiatExchangeRatesSuccessResponse {
  rates: FiatExchangeRates;
}

type GetFiatExchangeRatesErrorResponse =
  | {
      error: {
        code: string;
        message: string;
      };
    }
  | {
      error: {
        code: number;
        type: string;
        info: string;
      };
    };

interface GetFiatExchangeRatesParams {
  apiUrl: string;
  apiKey: string;
}

const fiatExchangeRatesKeyParser = StrictSchema<keyof FiatExchangeRates>()(
  z.union([
    z.literal("EUR"),
    z.literal("USD"),
    z.literal("JPY"),
    z.literal("GBP"),
    z.literal("CNY"),
  ])
);

const fiatExchangeRatesParser = StrictSchema<GetFiatExchangeRatesSuccessResponse>()(
  z.object({ rates: z.record(fiatExchangeRatesKeyParser, z.number()) })
);

const fiatExchangeRatesErrorParser = StrictSchema<GetFiatExchangeRatesErrorResponse>()(
  z.union([
    z.object({
      error: z.object({
        code: z.string(),
        message: z.string(),
      }),
    }),
    z.object({
      error: z.object({
        code: z.number(),
        type: z.string(),
        info: z.string(),
      }),
    }),
  ])
);

const errorResponseToString = (errorResponse: GetFiatExchangeRatesErrorResponse): string => {
  return `Fiat Exchange Rates API error: (${errorResponse.error.code}) ${
    "message" in errorResponse.error ? errorResponse.error.message : errorResponse.error.info
  }`;
};

const getFiatExchangeRates = ({
  apiUrl,
  apiKey,
}: GetFiatExchangeRatesParams): Promise<FiatExchangeRates> => {
  const params = {
    access_key: apiKey,
    base: Currency.USD,
    symbols: Object.values(Currency).join(","),
  };

  return axios
    .request({
      baseURL: apiUrl,
      params,
      method: "GET",
    })
    .then((res) => {
      const parsedSuccessResponse = fiatExchangeRatesParser.safeParse(res.data);
      const parsedErrorResponse = fiatExchangeRatesErrorParser.safeParse(res.data);
      if (parsedSuccessResponse.success) {
        return parsedSuccessResponse.data.rates;
      } else if (parsedErrorResponse.success) {
        throw errorResponseToString(parsedErrorResponse.data);
      } else {
        throw parsedSuccessResponse.error;
      }
    })
    .catch((error) => {
      if (axios.isAxiosError(error) && error.response) {
        const parsedError = fiatExchangeRatesErrorParser.safeParse(error.response.data);
        if (parsedError.success) {
          throw errorResponseToString(parsedError.data);
        } else {
          throw error;
        }
      } else {
        throw error;
      }
    });
};

export { getFiatExchangeRates };
