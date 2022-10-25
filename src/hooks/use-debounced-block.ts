import { useCallback, useEffect, useState } from "react";

import { ConnectedProvider } from "src/domain";
import { AsyncTask } from "src/utils/types";

type DebouncedBlockCallback = (blockNumber: number) => void;

const DEBOUNCE_TIME_IN_MS = 750;

const useDebouncedBlock = (connectedProvider: AsyncTask<ConnectedProvider, string>) => {
  const [listener, setListener] = useState<DebouncedBlockCallback>();
  const [blockNumber, setBlockNumber] = useState<number>();

  const addBlockListener = useCallback(
    (cb: DebouncedBlockCallback) => {
      if (!listener) {
        setListener(() => cb);
      }
    },
    [listener]
  );

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (listener && blockNumber) {
        listener(blockNumber);
      }
    }, DEBOUNCE_TIME_IN_MS);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [blockNumber, listener]);

  useEffect(() => {
    if (listener) {
      const onBlock = (newBlockNumber: number) => {
        if (!blockNumber || newBlockNumber > blockNumber) {
          setBlockNumber(newBlockNumber);
        }
      };

      if (connectedProvider.status === "successful") {
        void connectedProvider.data.provider.getBlockNumber().then((currentBlockNumber) => {
          onBlock(currentBlockNumber);
          connectedProvider.data.provider.on("block", onBlock);
        });
      }

      return () => {
        if (connectedProvider.status === "successful") {
          connectedProvider.data.provider.off("block", onBlock);
        }
      };
    }
  }, [blockNumber, connectedProvider, listener]);

  return addBlockListener;
};

export default useDebouncedBlock;
