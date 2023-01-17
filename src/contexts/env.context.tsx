import {
  FC,
  PropsWithChildren,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { loadEnv } from "src/adapters/env";
import { providerError } from "src/adapters/error";
import { useErrorContext } from "src/contexts/error.context";
import { Env } from "src/domain";
import { routes } from "src/routes";

const envContext = createContext<Env | undefined>(undefined);

const EnvProvider: FC<PropsWithChildren> = (props) => {
  const [env, setEnv] = useState<Env>();
  const { notifyError } = useErrorContext();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!env) {
      loadEnv()
        .then(setEnv)
        .catch((e) => {
          const error = providerError.safeParse(e);

          if (location.pathname !== routes.networkError.path) {
            if (error.success) {
              navigate(routes.networkError.path, { state: error.data });
            } else {
              notifyError(e);
            }
          }
        });
    }
  }, [env, location, navigate, notifyError]);

  const value = useMemo(() => {
    return env;
  }, [env]);

  return <envContext.Provider value={value} {...props} />;
};

const useEnvContext = (): Env | undefined => {
  return useContext(envContext);
};

export { EnvProvider, useEnvContext };
