import { z } from "zod";

import { StrictSchema } from "src/utils/type-safety";
import { tokenParser } from "src/adapters/tokens";
import { Env, RedirectRouterState, FormData, FormDataRouterState, Chain } from "src/domain";
import { BigNumber } from "ethers";

const redirectRouterStateParser = StrictSchema<RedirectRouterState>()(
  z.object({ redirectUrl: z.string() })
);

const chainKeyParser = StrictSchema<Chain["key"]>()(
  z.union([z.literal("ethereum"), z.literal("polygon-zkevm")])
);

const formDataRouterStateParser = (env: Env) =>
  StrictSchema<FormDataRouterState | null, FormData | null>()(
    StrictSchema<FormDataRouterState>()(
      z.object({
        from: chainKeyParser,
        to: chainKeyParser,
        token: tokenParser,
        amount: z.string(),
        estimatedFee: z.string(),
      })
    )
      .nullable()
      .transform((formData, ctx) => {
        if (formData === null) {
          return null;
        }
        const from = env.chains.find((chain) => chain.key === formData.from);
        if (from === undefined) {
          ctx.addIssue({
            fatal: true,
            code: z.ZodIssueCode.custom,
            message: `Could not find any chain matching the key '${formData.from}'`,
            path: ["formData", "from"],
          });
          return undefined as unknown as FormData;
        }
        const to = env.chains.find((chain) => chain.key === formData.to);
        if (to === undefined) {
          ctx.addIssue({
            fatal: true,
            code: z.ZodIssueCode.custom,
            message: `Could not find any chain matching the key '${formData.to}'`,
            path: ["formData", "to"],
          });
          return undefined as unknown as FormData;
        }
        return {
          from,
          to,
          token: formData.token,
          amount: BigNumber.from(formData.amount),
          estimatedFee: BigNumber.from(formData.estimatedFee),
        };
      })
  );

export function serializeFormData(formData: FormData): FormDataRouterState {
  const { from, to, token, amount, estimatedFee } = formData;
  return {
    from: from.key,
    to: to.key,
    token,
    amount: amount.toString(),
    estimatedFee: estimatedFee.toString(),
  };
}

export { redirectRouterStateParser, formDataRouterStateParser };
