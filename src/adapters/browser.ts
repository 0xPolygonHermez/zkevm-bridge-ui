import { z } from "zod";

import { RouterState } from "src/domain";
import { StrictSchema } from "src/utils/type-safety";

const routerStateParser = StrictSchema<RouterState>()(z.object({ redirectUrl: z.string() }));

export { routerStateParser };
