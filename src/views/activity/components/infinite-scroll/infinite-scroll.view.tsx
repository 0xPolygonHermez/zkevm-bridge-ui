import { FC, PropsWithChildren, useEffect, useRef, useState } from "react";

import { useInfiniteScrollStyles } from "src/views/activity/components/infinite-scroll/infinite-scroll.styles";
import { Spinner } from "src/views/shared/spinner/spinner.view";

const TRESHOLD = 0.9;

type InfiniteScrollProps = PropsWithChildren<{
  isLoading: boolean;
  onLoadNextPage: () => void;
}>;

export const InfiniteScroll: FC<InfiniteScrollProps> = ({
  children,
  isLoading,
  onLoadNextPage,
}) => {
  const classes = useInfiniteScrollStyles();
  const [scrollReachedEnd, setScrollReachedEnd] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
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

  useEffect(() => {
    if (scrollReachedEnd && !isLoading) {
      onLoadNextPage();
    }
    setScrollReachedEnd(false);
  }, [isLoading, scrollReachedEnd, onLoadNextPage]);

  useEffect(() => {
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
