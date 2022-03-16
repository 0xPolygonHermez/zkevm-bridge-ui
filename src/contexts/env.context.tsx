import { createContext, FC, useContext, useEffect, useState } from "react";

import { loadEnv } from "src/adapters/env";
import { Env } from "src/domain";

const envContext = createContext<Env | undefined>(undefined);

const EnvProvider: FC = (props) => {
  const [env, setEnv] = useState<Env>();

  useEffect(() => {
    setEnv(loadEnv());
  }, []);

  return <envContext.Provider value={env} {...props} />;
};

const useEnvContext = (): Env | undefined => {
  return useContext(envContext);
};

export { EnvProvider, useEnvContext };
