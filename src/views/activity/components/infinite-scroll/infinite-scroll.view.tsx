import React from "react";

import Spinner from "src/views/shared/spinner/spinner.view";
import useInfiniteScrollStyles from "src/views/activity/components/infinite-scroll/infinite-scroll.styles";

const TRESHOLD = 0.9;

interface InfiniteScrollProps {
  isLoading: boolean;
  onLoadNextPage: () => void;
}

const InfiniteScroll: React.FC<InfiniteScrollProps> = ({ children, isLoading, onLoadNextPage }) => {
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
    if (scrollReachedEnd && !isLoading) {
      onLoadNextPage();
    }
    setScrollReachedEnd(false);
  }, [isLoading, scrollReachedEnd, onLoadNextPage]);

  React.useEffect(() => {
    if (ref.current) {
      const isScrollVisible = ref.current.getBoundingClientRect().height > window.innerHeight;
      if (isScrollVisible === false) {
        onLoadNextPage();
      }
    }
  }, [onLoadNextPage]);

  return (
    <div className={classes.root} ref={ref}>
      {children}
      {isLoading && (
        <div className={classes.spinnerWrapper}>
          <Spinner size={32} />
        </div>
      )}
    </div>
  );
};

export default InfiniteScroll;
