import { z } from "zod";
import axios from "axios";

import { Currency, FiatExchangeRates } from "src/domain";
import { StrictSchema } from "src/utils/type-safety";

interface GetFiatExchangeRatesSuccessResponse {
  rates: FiatExchangeRates;
}

interface GetFiatExchangeRatesUnsuccessResponse {
  error: {
    code: number;
    type: string;
    info: string;
  };
}

interface GetFiatExchangeRatesError {
  error: {
    code: string;
    message: string;
  };
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

const getFiatExchangeRatesSuccessResponseParser =
  StrictSchema<GetFiatExchangeRatesSuccessResponse>()(
    z.object({ rates: z.record(fiatExchangeRatesKeyParser, z.number()) })
  );

const getFiatExchangeRatesUnsuccessResponseParser =
  StrictSchema<GetFiatExchangeRatesUnsuccessResponse>()(
    z.object({
      error: z.object({
        code: z.number(),
        type: z.string(),
        info: z.string(),
      }),
    })
  );

const getFiatExchangeRatesErrorParser = StrictSchema<GetFiatExchangeRatesError>()(
  z.object({
    error: z.object({
      code: z.string(),
      message: z.string(),
    }),
  })
);

interface GetFiatExchangeRatesParams {
  apiUrl: string;
  apiKey: string;
}

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
      const parsedSuccessResponse = getFiatExchangeRatesSuccessResponseParser.safeParse(res.data);
      const parsedUnsuccessResponse = getFiatExchangeRatesUnsuccessResponseParser.safeParse(
        res.data
      );
      if (parsedSuccessResponse.success) {
        return parsedSuccessResponse.data.rates;
      } else if (parsedUnsuccessResponse.success) {
        throw `Fiat Exchange Rates API error: (${parsedUnsuccessResponse.data.error.code}) ${parsedUnsuccessResponse.data.error.info}`;
      } else {
        throw parsedSuccessResponse.error;
      }
    })
    .catch((error) => {
      if (axios.isAxiosError(error) && error.response) {
        const parsedError = getFiatExchangeRatesErrorParser.safeParse(error.response.data);
        if (parsedError.success) {
          throw `Fiat Exchange Rates API error: (${parsedError.data.error.code}) ${parsedError.data.error.message}`;
        } else {
          throw error;
        }
      } else {
        throw error;
      }
    });
};

export { getFiatExchangeRates };
