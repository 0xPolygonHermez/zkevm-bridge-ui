import { useCallback } from "react";

import { useIsMounted } from "src/hooks/use-is-mounted";

export function useCallIfMounted(): (callback: () => void) => void {
  const isMounted = useIsMounted();
  return useCallback(
    (callback: () => void) => {
      if (isMounted()) {
        callback();
      }
    },
    [isMounted]
  );
}
