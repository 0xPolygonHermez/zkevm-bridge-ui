import { useEffect, useState } from "react";

import { AsyncTask, ConnectedProvider } from "src/domain";
import { useDebounce } from "src/hooks/use-debounce";
import { isAsyncTaskDataAvailable } from "src/utils/types";

const DEBOUNCE_TIME_IN_MS = 750;

export const useDebouncedBlock = (connectedProvider: AsyncTask<ConnectedProvider, string>) => {
  const [blockNumber, setBlockNumber] = useState<number>();

  useEffect(() => {
    if (isAsyncTaskDataAvailable(connectedProvider)) {
      void connectedProvider.data.provider
        .getBlockNumber()
        .then(setBlockNumber)
        .then(() => {
          connectedProvider.data.provider.on("block", setBlockNumber);
        });

      return () => {
        connectedProvider.data.provider.off("block", setBlockNumber);
      };
    }
  }, [connectedProvider]);

  return useDebounce(blockNumber, DEBOUNCE_TIME_IN_MS);
};
