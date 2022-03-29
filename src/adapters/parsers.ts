import { z } from "zod";

import { StrictSchema } from "src/utils/type-safety";
import { Env, FiatExchangeRates, RouterState } from "src/domain";
import {
  GetFiatExchangeRatesError,
  GetFiatExchangeRatesResponse,
} from "src/adapters/fiat-exchange-rates";

const envParser = StrictSchema<Env>()(
  z.object({
    REACT_APP_INFURA_API_KEY: z.string(),
    REACT_APP_L1_PROVIDER_NETWORK: z.string(),
    REACT_APP_L2_PROVIDER_URL: z.string(),
    REACT_APP_PRICE_ORACLE_CONTRACT_ADDRESS: z.string(),
    REACT_APP_USDT_CONTRACT_ADDRESS: z.string(),
    REACT_APP_FIAT_EXCHANGE_RATES_API_KEY: z.string(),
  })
);

const routerStateParser = StrictSchema<RouterState>()(z.object({ redirectUrl: z.string() }));

const ethereumAccountsParser = StrictSchema<string[]>()(z.array(z.string()));

const fiatExchangeRatesKeyParser = StrictSchema<keyof FiatExchangeRates>()(
  z.union([
    z.literal("EUR"),
    z.literal("USD"),
    z.literal("JPY"),
    z.literal("GBP"),
    z.literal("CNY"),
  ])
);

const fiatExchangeRatesParser = StrictSchema<GetFiatExchangeRatesResponse>()(
  z.object({ rates: z.record(fiatExchangeRatesKeyParser, z.number()) })
);

const fiatExchangeRatesErrorParser = StrictSchema<GetFiatExchangeRatesError>()(
  z.object({
    error: z.object({
      code: z.string(),
      message: z.string(),
    }),
  })
);

export {
  envParser,
  routerStateParser,
  ethereumAccountsParser,
  fiatExchangeRatesParser,
  fiatExchangeRatesErrorParser,
};
