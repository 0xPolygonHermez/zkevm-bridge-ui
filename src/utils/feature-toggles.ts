import { Env } from "src/domain";

export const areSettingsVisible = (env: Env): boolean => {
  return env.fiatExchangeRates.areEnabled;
};
