import { createContext, FC, useContext, useEffect, useMemo, useState } from "react";

import { loadEnv } from "src/adapters/env";
import { Env } from "src/domain";

const envContext = createContext<Env | undefined>(undefined);

const EnvProvider: FC = (props) => {
  const [env, setEnv] = useState<Env>();

  useEffect(() => {
    loadEnv().then(setEnv).catch(console.error);
  }, []);

  const value = useMemo(() => {
    return env;
  }, [env]);

  return <envContext.Provider value={value} {...props} />;
};

const useEnvContext = (): Env | undefined => {
  return useContext(envContext);
};

export { EnvProvider, useEnvContext };
