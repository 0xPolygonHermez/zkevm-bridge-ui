import { Env } from "src/domain";
import { envParser } from "src/adapters/parsers";

const loadEnv = (): Env => {
  return envParser.parse(process.env);
};

export { loadEnv };
