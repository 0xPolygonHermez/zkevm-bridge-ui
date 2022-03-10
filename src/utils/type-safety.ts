import { ZodSchema } from "zod";

import { Exact } from "./types";

export const StrictSchema: <T>() => <U>(
  u: Exact<ZodSchema<T>, ZodSchema<U>> extends true
    ? Exact<Required<T>, Required<U>> extends true
      ? ZodSchema<U>
      : never
    : never
) => ZodSchema<T> =
  () =>
  <T>(u: unknown) =>
    u as ZodSchema<T>;
