import { z } from "zod";

import { StrictSchema } from "src/utils/type-safety";
import { SupportedNetwork } from "src/domain";

interface Env {
  REACT_APP_INFURA_API_KEY: string;
  REACT_APP_FIAT_EXCHANGE_RATES_API_KEY: string;
  REACT_APP_NETWORK: SupportedNetwork;
}

const envParser = StrictSchema<Env>()(
  z.object({
    REACT_APP_INFURA_API_KEY: z.string(),
    REACT_APP_FIAT_EXCHANGE_RATES_API_KEY: z.string(),
    REACT_APP_NETWORK: z.nativeEnum(SupportedNetwork),
  })
);

const loadEnv = (): Env => {
  return envParser.parse(process.env);
};

export { loadEnv };
