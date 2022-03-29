import { fiatExchangeRatesErrorParser, fiatExchangeRatesParser } from "src/adapters/parsers";
import { FIAT_EXCHANGE_RATES_API_URL } from "src/constants";
import { Currency, FiatExchangeRates } from "src/domain";

export interface GetFiatExchangeRatesResponse {
  rates: FiatExchangeRates;
}

export interface GetFiatExchangeRatesError {
  error: {
    code: string;
    message: string;
  };
}

interface GetFiatExchangeRatesParams {
  apiKey: string;
}

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
        throw new Error("An error occurred when trying to parse the getFiatExchangeRates response");
      }
    } else {
      const error: unknown = await res.json();
      const parsedResponse = fiatExchangeRatesErrorParser.safeParse(error);

      if (parsedResponse.success) {
        throw parsedResponse.data.error;
      } else {
        throw new Error("An error occured when trying to parse the getFiatExchangeRates error");
      }
    }
  });
};

export { getFiatExchangeRates };
