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
import { useLocation, useNavigate } from "react-router-dom";
import routes from "src/routes";

const envContext = createContext<Env | undefined>(undefined);

const EnvProvider: FC<PropsWithChildren> = (props) => {
  const [env, setEnv] = useState<Env>();
  const { notifyError } = useErrorContext();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    loadEnv()
      .then(setEnv)
      .catch((e) => {
        if (location.pathname !== routes.underMaintenance.path && e === "noNetwork") {
          navigate(routes.underMaintenance.path);
        } else if (location.pathname !== routes.underMaintenance.path) {
          notifyError(e);
        }
      });
  }, [location, navigate, notifyError]);

  const value = useMemo(() => {
    return env;
  }, [env]);

  return <envContext.Provider value={value} {...props} />;
};

const useEnvContext = (): Env | undefined => {
  return useContext(envContext);
};

export { EnvProvider, useEnvContext };
