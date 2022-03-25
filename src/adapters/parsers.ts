import { z } from "zod";

import { StrictSchema } from "src/utils/type-safety";
import { Env, RouterState } from "src/domain";

const envParser = StrictSchema<Env>()(
  z.object({
    REACT_APP_INFURA_API_KEY: z.string(),
    REACT_APP_L1_PROVIDER_NETWORK: z.string(),
    REACT_APP_L2_PROVIDER_URL: z.string(),
    REACT_APP_PRICE_ORACLE_CONTRACT_ADDRESS: z.string(),
    REACT_APP_USDT_CONTRACT_ADDRESS: z.string(),
  })
);

const routerStateParser = StrictSchema<RouterState>()(z.object({ redirectUrl: z.string() }));

const ethereumAccountsParser = StrictSchema<string[]>()(z.array(z.string()));

export { envParser, routerStateParser, ethereumAccountsParser };
