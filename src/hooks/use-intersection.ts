export const useIntersection = ({
  className,
  observed,
  target,
}: {
  className: string;
  observed: React.RefObject<HTMLDivElement>;
  target: React.RefObject<HTMLDivElement>;
}) => {
  const observer = new IntersectionObserver((entries) => {
    const entry = entries[0];
    if (entry && entry.boundingClientRect.y < 0) {
      target.current && target.current.classList.add(className);
    } else {
      target.current && target.current.classList.remove(className);
    }
  });
  if (observed.current) {
    observer.observe(observed.current);
  }
};
