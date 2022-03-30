import { z } from "zod";

import { StrictSchema } from "src/utils/type-safety";
import { Env } from "src/domain";

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

const loadEnv = (): Env => {
  return envParser.parse(process.env);
};

export { loadEnv };
