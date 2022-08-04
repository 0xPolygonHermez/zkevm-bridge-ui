import {
  createContext,
  FC,
  PropsWithChildren,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { loadEnv } from "src/adapters/env";
import { Env } from "src/domain";
import { useErrorContext } from "src/contexts/error.context";

const envContext = createContext<Env | undefined>(undefined);

const EnvProvider: FC<PropsWithChildren> = (props) => {
  const [env, setEnv] = useState<Env>();
  const { notifyError } = useErrorContext();

  useEffect(() => {
    loadEnv().then(setEnv).catch(notifyError);
  }, [notifyError]);

  const value = useMemo(() => {
    return env;
  }, [env]);

  return <envContext.Provider value={value} {...props} />;
};

const useEnvContext = (): Env | undefined => {
  return useContext(envContext);
};

export { EnvProvider, useEnvContext };
