import { z } from "zod";

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
  const requestQueryParams = new URLSearchParams({
    access_key: apiKey,
    base: Currency.USD,
    symbols: Object.values(Currency).join(","),
  });
  const requestUrl = `${FIAT_EXCHANGE_RATES_API_URL}?${requestQueryParams.toString()}`;

  return fetch(requestUrl).then(async (res) => {
    if (res.ok) {
      const data: unknown = await res.json();
      const parsedResponse = fiatExchangeRatesParser.safeParse(data);

      if (parsedResponse.success) {
        return parsedResponse.data.rates;
      } else {
        throw parsedResponse.error;
      }
    } else {
      const error: unknown = await res.json();
      const parsedResponse = fiatExchangeRatesErrorParser.safeParse(error);

      if (parsedResponse.success) {
        throw parsedResponse.data.error;
      } else {
        throw parsedResponse.error;
      }
    }
  });
};

export { getFiatExchangeRates };
