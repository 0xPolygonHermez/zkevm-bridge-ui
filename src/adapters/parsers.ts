import { z } from "zod";

import { StrictSchema } from "src/utils/type-safety";

const ethereumAccountsParser = StrictSchema<string[]>()(z.array(z.string()));

export { ethereumAccountsParser };
