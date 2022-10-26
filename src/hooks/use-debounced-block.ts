import { useEffect, useState } from "react";

import { useDebounce } from "src/hooks/use-debounce";
import { AsyncTask, isAsyncTaskDataAvailable } from "src/utils/types";
import { ConnectedProvider } from "src/domain";

const DEBOUNCE_TIME_IN_MS = 750;

const useDebouncedBlock = (connectedProvider: AsyncTask<ConnectedProvider, string>) => {
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

export default useDebouncedBlock;
