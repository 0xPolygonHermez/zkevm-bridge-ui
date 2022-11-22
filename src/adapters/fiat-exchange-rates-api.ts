import axios from "axios";
import { z } from "zod";

import { Currency, FiatExchangeRates } from "src/domain";
import { StrictSchema } from "src/utils/type-safety";

interface GetFiatExchangeRatesSuccessResponse {
  rates: FiatExchangeRates;
}

interface GetFiatExchangeRatesUnsuccessResponse {
  error: {
    code: number;
    info: string;
    type: string;
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
        info: z.string(),
        type: z.string(),
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
  apiKey: string;
  apiUrl: string;
}

const getFiatExchangeRates = ({
  apiKey,
  apiUrl,
}: GetFiatExchangeRatesParams): Promise<FiatExchangeRates> => {
  const params = {
    access_key: apiKey,
    base: Currency.USD,
    symbols: Object.values(Currency).join(","),
  };

  return axios
    .request({
      baseURL: apiUrl,
      method: "GET",
      params,
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
