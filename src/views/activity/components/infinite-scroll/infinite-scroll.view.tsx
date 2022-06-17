import React from "react";

import Spinner from "src/views/shared/spinner/spinner.view";
import useInfiniteScrollStyles from "src/views/activity/components/infinite-scroll/infinite-scroll.styles";
import { AsyncTask } from "src/utils/types";

const TRESHOLD = 0.9;

interface InfiniteScrollProps {
  asyncTaskStatus: AsyncTask<never, never>["status"];
  onLoadNextPage: () => void;
  endReached: boolean;
}

const InfiniteScroll: React.FC<InfiniteScrollProps> = ({
  asyncTaskStatus,
  endReached,
  children,
  onLoadNextPage,
}) => {
  const classes = useInfiniteScrollStyles();
  const [scrollReachedEnd, setScrollReachedEnd] = React.useState(false);
  const ref = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    const onScroll = () => {
      if (
        ref.current &&
        ref.current.getBoundingClientRect().bottom * TRESHOLD <= window.innerHeight
      ) {
        setScrollReachedEnd(true);
      }
    };

    if (ref.current !== null) {
      document.addEventListener("scroll", onScroll);

      return () => document.removeEventListener("scroll", onScroll);
    }
  }, [ref]);

  React.useEffect(() => {
    if (scrollReachedEnd && asyncTaskStatus === "successful") {
      onLoadNextPage();
    }
    setScrollReachedEnd(false);
  }, [asyncTaskStatus, scrollReachedEnd, onLoadNextPage]);

  return (
    <div className={classes.root} ref={ref}>
      {children}
      {endReached && asyncTaskStatus === "reloading" && (
        <div className={classes.spinnerWrapper}>
          <Spinner size={24} />
        </div>
      )}
      {endReached === false && (
        <div className={classes.loadMoreButtonWrapper}>
          <button
            className={classes.loadMoreButton}
            onClick={onLoadNextPage}
            disabled={asyncTaskStatus === "reloading"}
          >
            {asyncTaskStatus === "reloading" ? <Spinner size={20} color="white" /> : "Load More"}
          </button>
        </div>
      )}
    </div>
  );
};

export default InfiniteScroll;
