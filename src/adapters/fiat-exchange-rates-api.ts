import { z } from "zod";
import axios from "axios";

import { Currency, FiatExchangeRates } from "src/domain";
import { StrictSchema } from "src/utils/type-safety";
import { FIAT_EXCHANGE_RATES_API_URL } from "src/constants";

interface GetFiatExchangeRatesSuccessResponse {
  rates: FiatExchangeRates;
}

interface GetFiatExchangeRatesErrorResponse {
  error: {
    code: string;
    message: string;
  };
}

interface GetFiatExchangeRatesParams {
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
  z.object({
    error: z.object({
      code: z.string(),
      message: z.string(),
    }),
  })
);

const getFiatExchangeRates = ({
  apiKey,
}: GetFiatExchangeRatesParams): Promise<FiatExchangeRates> => {
  const params = {
    access_key: apiKey,
    base: Currency.USD,
    symbols: Object.values(Currency).join(","),
  };

  return axios
    .request({
      baseURL: FIAT_EXCHANGE_RATES_API_URL,
      params,
      method: "GET",
    })
    .then((res) => {
      const parsedRes = fiatExchangeRatesParser.safeParse(res.data);

      if (parsedRes.success) {
        return parsedRes.data.rates;
      } else {
        throw parsedRes.error;
      }
    })
    .catch((error) => {
      if (axios.isAxiosError(error) && error.response) {
        const parsedError = fiatExchangeRatesErrorParser.safeParse(error.response.data);

        if (parsedError.success) {
          throw parsedError.data.error;
        } else {
          throw parsedError.error;
        }
      } else {
        throw error;
      }
    });
};

export { getFiatExchangeRates };
